/**
 * 개발자 : 김연주
 * 개발일 : 2025년 03월 20일
 * 개발목적 :
 * Spring Security 로그인 성공 시 사용자 정보 JSON 반환 및 로그인 기록 저장을 담당
 * 주요 내용:
 1. `UserLogRecordService`를 통해 사용자 로그인 내역 저장 (IP 주소 등 기록)
 2. 사용자 정보를 JSON 응답으로 전달 (`UserSecurityDto` 사용)
 * 참고 :
 - `AuthenticationSuccessHandler` 인터페이스 구현체
 - 객체 매핑은 `ObjectMapper`을 사용하며 JSON 형태 반환
 * 수정사항 :
 1. 수정자 / 일자 : 김연주 / 2025년 04월 17일
 - 내용 : 로그인 시 사용자 권한에 따라 IP 제한 로직 분기 처리
 - 로그인 성공시 실패 카운트 초기화 기능 추가
 2. 수정자 / 일자 : 최유진 / 2025년 05월 25일
 - 내용 : 리팩토링으로 인한 import문 수정
 3. 수정자 / 일자 : 김연주 / 2025년 05월 26일
 - 내용 : 권한별 redirectURL 설정
 4. 수정자 / 일자 : 최유진 / 2025년 06월 19일
 - 내용 : 로그인 실패 시 에러 로그 기록 추가, 로그 status 기록 추가
 5. 수정자 / 일자 : 최유진 / 2025년 07월 07일
 - 내용 : 로그 action 타입을 LogEventType으로 변경
 6. 수정자 / 일자 : 한서흔 / 2025년 09월 04일
 - 내용 : EC Admin 로그인 시 조건 추가.
 7. 수정자 / 일자 : 한서흔 / 2025년 09월 26일
 - 내용 : EC_ADMIN 로그인 시 Account Deposit으로 이동하도록 변경.
 8. 수정자 / 일자 : 김연주 / 2025년 09월 30일
 - 내용 : Password Reset 후 첫 로그인 Admin, Super Admin 권한 개인정보 수정 화면으로 이동
 9. 수정자 / 일자 : 김연주 / 2025년 10월 14일
 - 내용 : Remit Admin 권할 설정 추가
 */
package com.nnp.qsremit.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nnp.qsremit.Entity.user.UserType;
import com.nnp.qsremit.dto.user.UserSecurityDto;
import com.nnp.qsremit.repository.AllowedIpRepository;
import com.nnp.qsremit.service.user.UserPasswordService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class LoginSuccessHandler implements AuthenticationSuccessHandler, ApplicationListener<AuthenticationSuccessEvent> {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AllowedIpRepository allowedIpRepository;
    private final UserPasswordService userPasswordService;
    private final LoginAttemptService loginAttemptService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        if (authentication.getPrincipal() instanceof UserSecurityDto user) {
            String userId = user.getUsername();
            String ipAddress = request.getRemoteAddr();

            UserType userType = user.getUserType();

            if (userType == UserType.ADMIN || userType == UserType.REMIT_ADMIN) {
                OffsetDateTime now = OffsetDateTime.now();

                boolean isAllowed = allowedIpRepository
                        .findValidIp(ipAddress, now)
                        .isPresent();

                if (!isAllowed) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("Your IP address is not authorized to access this resource.");
                    return;
                }
            }

            String redirectURL = "/dashboard";

            Map<String, Object> result = new HashMap<>();
            result.put("userId", user.getUsername());
            result.put("userType", user.getUserType());
            result.put("name", user.getName());
            result.put("email", user.getEmail());
            result.put("mobile", user.getMobile());
            result.put("transactionReport", user.isTransactionReport());
            result.put("redirectUrl", redirectURL);

            response.getWriter().write(objectMapper.writeValueAsString(result));
        }
    }

    @Override
    public void onApplicationEvent(AuthenticationSuccessEvent event) {
        String username = event.getAuthentication().getName();
        loginAttemptService.onLoginSuccess(username);
    }
}
