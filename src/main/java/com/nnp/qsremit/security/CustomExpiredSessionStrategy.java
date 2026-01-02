/**
 * 개발자 : 김연주
 * 개발일 : 2025년 08월 18일
 * 개발목적 : 세션 만료 시 사용자에게 로그인 페이지로 리다이렉트 처리
 * 참고 : Spring Security SessionInformationExpiredStrategy
 * 수정사항 :
 1. 수정자 / 일자 :
 - 내용 :
 */

package com.nnp.qsremit.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.session.SessionInformationExpiredEvent;
import org.springframework.security.web.session.SessionInformationExpiredStrategy;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomExpiredSessionStrategy implements SessionInformationExpiredStrategy {
    @Override
    public void onExpiredSessionDetected(SessionInformationExpiredEvent event) throws IOException {
        HttpServletRequest request = event.getRequest();
        HttpServletResponse response = event.getResponse();

        response.sendRedirect(request.getContextPath() + "/login?timeout");
    }
}
