/**
 * 개발자 : 최유진
 * 개발일 :
 * 개발목적 : Log Event Type을 관리하기 위한 enum 클래스
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 최유진 / 2025년 07월 07일
 - 내용 : APICALL, CRAWLING 추가.
 */

package com.nnp.qsremit.Entity.user.logRecord;

public enum LogEventType {
    LOGIN, LOGOUT, CREATE, UPDATE, DELETE, APICALL, CRAWLING
}
