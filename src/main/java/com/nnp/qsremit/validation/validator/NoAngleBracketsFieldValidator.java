/**
 * 개발자 : 김연주
 * 개발일 : 2025년 08월 14일
 * 개발목적 : <와 > 문자를 입력값으로 허용하지 않도록 검증하는 애너테이션 정의
 * 참고 : jakarta.validation.Constraint 사용
 * 수정사항 :
 * 1. 수정자 / 일자 :
 *    - 내용 :
 */

package com.nnp.qsremit.validation.validator;

import com.nnp.qsremit.validation.annotation.NoAngleBrackets;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class NoAngleBracketsFieldValidator implements ConstraintValidator<NoAngleBrackets, String> {
    private static final String FORBIDDEN = "[<>＜＞‹›]";

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        System.out.println("=== NoAngleBracketsFieldValidator 실행 ===");
        System.out.println("검증 값: " + (value != null ? value.substring(0, Math.min(value.length(), 50)) : "null"));
        if (value == null) return true;
        return !value.matches(".*" + FORBIDDEN + ".*");
    }
}