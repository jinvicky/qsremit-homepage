/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 09월 23일
 * 개발목적 : (PG) Report Management 합계 계산을 위한 Projection.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 작성자 / 2025년 00월 00일
 - 내용 :
 */

package com.nnp.qsremit.controller.pgManagement.PGReportManagement.dto;

import java.math.BigDecimal;

public interface PGReportResponseProjection {
    Long getAccountDepositTypeId();
    String getCustomerName();
    String getCustomerEmail();
    Long getReceiptNo();
    Long getMonthlyCounts();
    BigDecimal getMonthlyTotalAmount();
    BigDecimal getMonthlyFeeJPY();
    BigDecimal getMonthlyTotalPaymentAmount();
    BigDecimal getMonthlyTotalRefundAmount();
    BigDecimal getMonthlySettlementAmount();
}
