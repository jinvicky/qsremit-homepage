/**
 * 개발자 : 김연주
 * 개발일 : 2025년 08월 14일
 * 개발목적 : <와 > 문자를 입력값으로 허용하지 않도록 검증하는 애너테이션 정의
 * 참고 : jakarta.validation.Constraint 사용
 * 수정사항 :
 * 1. 수정자 / 일자 :
 *    - 내용 :
 */

package com.nnp.qsremit.validation.annotation;


import com.nnp.qsremit.validation.validator.NoAngleBracketsFieldValidator;
import com.nnp.qsremit.validation.validator.NoAngleBracketsTypeValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = {
        NoAngleBracketsFieldValidator.class,
        NoAngleBracketsTypeValidator.class
})
@Target({ ElementType.FIELD, ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface NoAngleBrackets {

    String message() default "< and > characters are not allowed";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    String[] excludeFields() default {};
}