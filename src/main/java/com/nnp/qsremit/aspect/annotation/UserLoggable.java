/**
 * 개발자 : 최유진
 * 개발일 : 2025년 03월 27일
 * 개발목적 :
 - User Log 기록 시 기록 시점을 제어하기 위한 annotation을 정의한 클래스입니다.
 - 어노테이션을 통해 각 API의 동작 유형을 CREATE, UPDATE, DELETE로 지정하고
 - 동작 유형에 따라 로그를 기록합니다.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 최유진 / 2025년 07월 07일
 - 내용 : 로그 action 타입을 LogEventType으로 변경
 */

package com.nnp.qsremit.aspect.annotation;


import com.nnp.qsremit.Entity.user.logRecord.LogEventType;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD) // 메서드에만 적용 가능
@Retention(RetentionPolicy.RUNTIME) // 런타임 시점에 유지
public @interface UserLoggable {
    LogEventType actionType();
}