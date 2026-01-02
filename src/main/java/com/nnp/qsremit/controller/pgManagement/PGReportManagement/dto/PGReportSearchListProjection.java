/**
 * 개발자 : 김연주
 * 개발일 : 2025년 10월 13일
 * 개발목적 :
 *  - PG 월별 리포트 조회용 Projection 인터페이스
 *  - MonthlyReportEntity 및 AccountDepositTypeEntity의 일부 필드만 조회하여 화면 표시용 DTO로 활용
 * 수정사항 :
 * 1. 수정자 / 일자 :
 *    - 내용 :
 */

package com.nnp.qsremit.controller.pgManagement.PGReportManagement.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public interface PGReportSearchListProjection {
    Long getAccountDepositTypeId();
    Long getAccountDepositTypeReceiptNo();
    String getAccountDepositTypeCustomerType();
    BigDecimal getTotalSettlementAmount();
    OffsetDateTime getMailSentAt();
    String getReportMonth();
}
