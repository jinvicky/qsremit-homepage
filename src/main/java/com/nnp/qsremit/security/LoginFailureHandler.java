/**
 * 개발자 : 김연주
 * 개발일 : 2025년 04월 17일
 * 개발목적 : 로그인 실패 처리 로직 구현
 * 참고 : Spring Security의 AuthenticationFailureHandler 구현
 * 수정사항 :
 1. 수정자 / 일자 : 김연주 / 2025년 04월 18일
 - 내용 : isLock 조건 추가 및 Alert Message 추가
 2. 수정자 / 일자 : 김연주 / 2025년 08월 12일
 - 내용 : 계정 잠금 시 응답 메시지를 통해 자격 증명을 유추할 수 없도록 처리
*/
package com.nnp.qsremit.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class LoginFailureHandler implements AuthenticationFailureHandler {

    private final LoginAttemptService loginAttemptService;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, org.springframework.security.core.AuthenticationException exception) throws IOException, ServletException {

        String username = request.getParameter("id");
        boolean isLock = loginAttemptService.onLoginFailure(username) || loginAttemptService.isAccountLocked(username);

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.getWriter().write("Login failed. Please check your username and password.");
    }
}
