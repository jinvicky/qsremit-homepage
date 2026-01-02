/**
 * 개발자 : 김연주
 * 개발일 : 2025년 07월 04일
 * 개발목적 : 이 어노테이션은 특정 클래스나 메서드가 `SUPER_ADMIN` 권한을 가진 사용자만 접근 가능하도록 설정합니다.
 * 참고 :
 - Spring Security의 `@PreAuthorize`를 활용하여 접근 제어를 구현합니다.
 - `@PreAuthorize("hasRole('SUPER_ADMIN')")`를 통해 명시적으로 `SUPER_ADMIN` 권한 필요성을 선언.
 * 수정사항 :
 1. 수정자 / 일자 :
 - 내용 :
 */
package com.nnp.qsremit.security.annotation;

import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasRole('SUPER_ADMIN')")
public @interface SuperAdminOnly {
}
