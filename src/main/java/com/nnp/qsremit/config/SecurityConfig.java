/**
 * 개발자 : 김영하
 * 개발일 : 2024년 11월 23일
 * 개발목적 :
 * Spring Security의 보안 설정을 정의하는 클래스입니다.
 - HTTP 보안 설정, 사용자 인증, 비밀번호 인코딩 등을 구성합니다.
 - CustomUserDetailsService와 연동하여 데이터베이스 기반 사용자 인증을 구현하거나, 주석 처리된 코드처럼 In-Memory UserDetailsService로 간단한 테스트도 가능합니다.
 * 주요 내용 :
 - `securityFilterChain` : HTTP 보안 필터 체인 구성 (인증 및 권한 설정 담당).
 - `passwordEncoder` : 비밀번호를 암호화하여 보안을 강화하기 위한 PasswordEncoder를 정의.
 * 참고 :
 - Spring Security의 커스텀 보안 설정으로 사용.
 - `@Configuration` 및 `@EnableWebSecurity`를 통해 Spring Security 구성 클래스임을 선언.
 * 수정사항 :
 1. 수정자 / 일자 : 김연주 / 2025년 3월 13일
 - 내용 : UserEntity로 연동하기 위해 기존 In-Memory UserDetailsService 코드 주석 처리.
 2. 수정자 / 일자 : 최유진 / 2025년 03월 13일
 - 내용 : DB에 등록하는 user는 하드코딩된 정보를 사용 중
 3. 수정자 / 일자 : 최유진 / 2025년 03월 14일
 - 내용 : DB에 등록하는 user 아이디 정보 수정 및 하드코딩 요소 삭제
 4. 수정자 / 일자 : 김연주 / 2025년 3월 20일
 - 내용 : 로그인 성공 시 처리 로직을 `LoginSuccessHandler`로 분리.
 - 기존: SecurityConfig 내부에서 로그인 성공 처리 로직 직접 구현.
 - 변경: `AuthenticationSuccessHandler` 구현체인 `LoginSuccessHandler`로 로직 위임.
 5. 수정자 / 일자 : 김연주 / 2025년 03월 25일
 - 내용 : csrf 설정 추가
 6. 수정자 / 일자 : 채호정 / 2025년 03월 26일
 - 내용 : 사용하지 않는 import구문 삭제
 7. 수정자 / 일자 : 김연주 / 2025년 04월 16일
 - 내용 : 커스텀 필터(IpFilter) 적용하여 요청 차단
 6. 수정자 / 일자 : 김연주 / 2025년 04월 17일
 - 내용 : 커스텀 필터(IpFilter) 삭제, 로그인 사용자 권한에 따라 접속 가능한 IP를 제한
 - 내용 : 로그인 실패 로직을 별도 클래스로 분리 및 적용
 7. 수정자 / 일자 : 김연주 / 2025년 05월 12일
 - 내용 : 인증 없이 회원가입 가능하도록 예외 설정
 8. 수정자 / 일자 : 김연주 / 2025년 05월 16일
 - 내용 : 웹과 앱 보안 필터 체인
 9. 수정자 / 일자 : 김연주 / 2025년 05월 21일
 - 내용 : /api/v1/transaction/transferAmount 엔드포인트 인증 없이 접근 허용
 10. 수정자 / 일자 : 김연주 / 2025년 05월 26일
 - 내용 : 서버 redirect 로직 제거 및 프론트에서 처리하도록 변경
 11. 수정자 / 일자 : 최유진 / 2025년 05월 26일
 - 내용 : 리팩토링으로 인한 import문 수정
 12. 수정자 / 일자 : 최유진 / 2025년 06월 19일
 - 내용 : 로그아웃 로그 기록 시 status 기록 추가
 13. 수정자 / 일자 : 김연주 / 2025년 06월 27일
 - 내용 : 세션 만료 redirect url 추가
 14. 수정자 / 일자 : 최유진 / 2025년 07월 07일
 - 내용 : 로그 action 타입을 LogEventType으로 변경
 15. 수정자 / 일자 : 김연주 / 2025년 07월 16일
 - 내용 : exceptionHandling 추가
 16. 수정자 / 일자 : 김연주 / 2025년 07월 18일
 - 내용 : 계정 삭제 안내 페이지 시큐리티 예외 경로 추가
 17. 수정자 / 일자 : 김연주 / 2025년 08월 12일
 - 내용 : 계정 비밀번호 초기화 페이지 시큐리티 예외 경로 추가
 18. 수정자 / 일자 : 김연주 / 2025년 08월 14일
 - 내용 : MIME 스니핑 방지, 클릭재킹 방지, Referrer 정보 최소화 보안 헤더 추가
 19. 수정자 / 일자 : 김연주 / 2025년 08월 18일
 - 내용 : 세션 동시 로그인 제어 및 만료 처리 리다이렉트 적용
*/

package com.nnp.qsremit.config;

import com.nnp.qsremit.security.CustomUserDetailsService;
import com.nnp.qsremit.security.LoginFailureHandler;
import com.nnp.qsremit.security.LoginSuccessHandler;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.annotation.web.configurers.SessionManagementConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.session.SessionInformationExpiredStrategy;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final LoginSuccessHandler loginSuccessHandler;
	private final LoginFailureHandler loginFailureHandler;
	private final SessionRegistry sessionRegistry;
	private final SessionInformationExpiredStrategy expiredStrategy;

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http, DaoAuthenticationProvider userAuthenticationProvider) throws Exception {

		http
				.securityMatcher("/**")
				.csrf(csrf -> csrf
						.ignoringRequestMatchers("/processLogin", "/logout", "/reset", "/accountDeletion"))
				.authenticationProvider(userAuthenticationProvider)
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers(
								"/",
								"/kr/**",
								"/en/**",
								"/login",
								"/processLogin",
								"/reset",
								"/accountDeletion",
								"/api/v1/auth/**",
								"/api/v1/transaction/**",
								"/css/**",
								"/js/**",
							   "/images/**",
								"/fonts/**",
								"/static/**"
						).permitAll()
						.requestMatchers("/admin/**","/dashboard", "/profileSettings/**").authenticated()
						.anyRequest().permitAll()
				)
				.formLogin(form -> form
						.loginPage("/login")
						.loginProcessingUrl("/processLogin")
						.usernameParameter("id")
						.passwordParameter("password")
						.successHandler(loginSuccessHandler)
						.failureHandler(loginFailureHandler)
						.permitAll()
				)
				.logout(logout -> logout
						.logoutUrl("/logout")
						.logoutSuccessUrl("/login?logout=true")
						.addLogoutHandler((request, response, authentication) -> {
							HttpSession httpSession = request.getSession(false);
							if (httpSession != null) {
								httpSession.invalidate();
							}
						})
						.invalidateHttpSession(true)
						.clearAuthentication(true)
						.deleteCookies("remember-me")
						.permitAll()
				)
				.sessionManagement(session -> session
						.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
						.sessionFixation(SessionManagementConfigurer.SessionFixationConfigurer::migrateSession)
						.sessionConcurrency(concurrency -> concurrency
								.maximumSessions(1)
								.maxSessionsPreventsLogin(false)
								.expiredUrl("/login?timeout")
								.expiredSessionStrategy(expiredStrategy)
								.sessionRegistry(sessionRegistry)
						)
				)
				.headers(headers -> headers
						.contentTypeOptions(withDefaults())
						.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
						.referrerPolicy(referrer ->
								referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
						)
				);

		return http.build();
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public DaoAuthenticationProvider userAuthenticationProvider(CustomUserDetailsService userDetailsService) {
		DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
		provider.setUserDetailsService(userDetailsService);
		provider.setPasswordEncoder(passwordEncoder());
		return provider;
	}
}
