/**
 * 개발자 : 김연주
 * 개발일 : 2025년 08월 18일
 * 개발목적 : 세션 관리 및 동시 로그인 제어를 위한 SessionRegistry, HttpSessionEventPublisher 설정
 * 참고 : Spring Security Session 관리 설정 문서
 * 수정사항 :
 1. 수정자 / 일자 :
 - 내용 :
 */

package com.nnp.qsremit.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.web.session.HttpSessionEventPublisher;

@Configuration
public class SessionConfig {
    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }

    @Bean
    public static HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher();
    }
}
