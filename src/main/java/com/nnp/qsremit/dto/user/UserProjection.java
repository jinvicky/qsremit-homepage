/**
 * 개발자 : 김연주
 * 개발일 : 2025년 04월 21일
 * 개발목적 : 사용자 정보를 조회하기 위한 Projection 인터페이스 정의
 * 참고 : UserProjection 인터페이스
 * 수정사항 :
 1. 수정자 / 일자 :
 - 내용 :
 */
package com.nnp.qsremit.dto.user;

import java.time.OffsetDateTime;

public interface UserProjection {
    Long getId();
    String getUserType();
    String getUserId();
    String getName();
    OffsetDateTime getCreateAt();
    Boolean getAccountLocked();
}
