/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 05월 29일
 * 개발목적 : EC Customer 정보를 조회하기 위한 Projection 인터페이스 정의.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 한서흔 / 2025년 07월 01일
 - 내용 : Branch 속성 관련 삭제.
 2. 수정자 / 일자 : 한서흔 / 2025년 07월 02일
 - 내용 : getEcStatus 추가.
 */
package com.nnp.qsremit.controller.pgManagement.ECCustomerManagement.dto;

import java.time.OffsetDateTime;

public interface ECCustomerProjection {
    Long getId();
    String getEcBankName();
    String getEcAccountNo();
    String getEcHolderName();
    String getEcType();
    String getEcReason();
    String getEcReceiver();
    String getEcCompanyName();
    String getEcStatus();
    OffsetDateTime getCreatedAt();
}
