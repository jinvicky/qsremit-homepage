/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 09월 11일
 * 개발목적 : PG Report Management 각 일자별 통계 데이터를 조회하기 위한 Dto 설계.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 한서흔 / 2025년 09월 16일
 - 내용 : BigDecimal 변경.
 */

package com.nnp.qsremit.controller.pgManagement.PGReportManagement.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class PGReportDailySummaryDto {
    private OffsetDateTime depositDate; // createdAt
    private Long counts;
    private BigDecimal totalAmount;
    private BigDecimal feeJPY;
    private BigDecimal totalPaymentAmount;
    private BigDecimal totalRefundAmount;
    private OffsetDateTime depositAt;
    private BigDecimal exchangeRate;
    private BigDecimal settlementAmount;

    public PGReportDailySummaryDto(
            OffsetDateTime depositDate,
            Long counts,
            BigDecimal totalAmount,
            BigDecimal feeJPY,
            BigDecimal totalPaymentAmount,
            OffsetDateTime depositAt,
            BigDecimal exchangeRate,
            BigDecimal settlementAmount
    ) {
        this.depositDate = depositDate;
        this.counts = counts;
        this.totalAmount = totalAmount;
        this.feeJPY = feeJPY;
        this.totalPaymentAmount = totalPaymentAmount;
        this.totalRefundAmount = BigDecimal.ZERO;
        this.depositAt = depositAt;
        this.exchangeRate = exchangeRate;
        this.settlementAmount = settlementAmount;
    }
}
