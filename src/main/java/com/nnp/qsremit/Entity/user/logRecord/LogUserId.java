/**
 * 개발자 : 김연주
 * 개발일 : 2025년 07월 15일
 * 개발목적 : 사용자 로그 기록 시 사용자 유형(익명, 모바일, 시스템 등)을 구분하기 위한 ENUM 클래스
 * 참고 : 로그 기록 시 userId가 없는 경우 구분자로 사용
 * 수정사항 :
 * 1. 수정자 / 일자 :
 *    - 내용 :
 */
package com.nnp.qsremit.Entity.user.logRecord;

import lombok.Getter;

@Getter
public enum LogUserId {
    ANONYMOUS("anonymous"),
    MOBILE("mobile"),
    SYSTEM("system"),
    CRAWLING("crawling");

    private final String value;

    LogUserId(String value) {
        this.value = value;
    }
}
