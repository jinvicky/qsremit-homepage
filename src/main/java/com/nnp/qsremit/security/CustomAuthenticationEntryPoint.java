/**
 * 개발자 : 김연주
 * 개발일 : 2025년 07월 16일
 * 개발목적 : 인증되지 않은 요청에 대해 적절한 응답을 반환하고 로그를 남기기 위함.
 * 참고 : Spring Security의 AuthenticationEntryPoint 구현
 * 수정사항 :
 * 1. 수정자 / 일자 :
 *    - 내용 :
 */

package com.nnp.qsremit.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;


@Slf4j
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private static final String APPLICATION_JSON = "application/json";

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(APPLICATION_JSON);
        response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"" + authException.getMessage() + "\"}");
    }
}
