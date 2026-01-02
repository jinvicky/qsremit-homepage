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
import com.nnp.qsremit.validation.annotation.SafeQuillHtml;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class NoAngleBracketsTypeValidator implements ConstraintValidator<NoAngleBrackets, Object> {
    private static final String FORBIDDEN = "[<>＜＞‹›]";
    private Set<String> exclude = new HashSet<>();

    @Override
    public void initialize(NoAngleBrackets anno) {
        exclude = new HashSet<>(Arrays.asList(anno.excludeFields()));
    }

    @Override
    public boolean isValid(Object obj, ConstraintValidatorContext context) {
        if (obj == null) return true;

        System.out.println("=== NoAngleBracketsTypeValidator 실행 ===");
        System.out.println("검증 대상 클래스: " + obj.getClass().getName());

        boolean ok = true;
        for (Field f : obj.getClass().getDeclaredFields()) {
            System.out.println("필드 검사: " + f.getName());
            System.out.println("  - excludeFields 포함? " + exclude.contains(f.getName()));
            System.out.println("  - @SafeQuillHtml 적용? " + f.isAnnotationPresent(SafeQuillHtml.class));

            if (exclude.contains(f.getName()) || f.isAnnotationPresent(SafeQuillHtml.class)) continue;
            System.out.println("  → 검증 제외");
            if (f.getType() != String.class) continue;

            f.setAccessible(true);
            try {
                Object val = f.get(obj);
                if (val instanceof String s && s.matches(".*" + FORBIDDEN + ".*")) {

                    context.disableDefaultConstraintViolation();
                    context.buildConstraintViolationWithTemplate(
                                    "Field '" + f.getName() + "' must not contain < or >")
                            .addPropertyNode(f.getName())
                            .addConstraintViolation();
                    ok = false;
                }
            } catch (IllegalAccessException ignored) {}
        }
        return ok;
    }
}
