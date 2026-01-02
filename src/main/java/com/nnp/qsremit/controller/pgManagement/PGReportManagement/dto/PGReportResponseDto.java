/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 09월 11일
 * 개발목적 : PG Report Management 영수증 미리보기 화면 구성을 위한 Dto 설계.
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
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class PGReportResponseDto {
    private Long accountDepositTypeId;
    private String customerName;
    private String customerEmail;
    private Long receiptNo;

    List<PGReportDailySummaryDto> dailySummaryList;

    // Total
    private Long monthlyCounts;
    private BigDecimal monthlyTotalAmount;
    private BigDecimal monthlyFeeJPY;
    private BigDecimal monthlyTotalPaymentAmount;
    private BigDecimal monthlyTotalRefundAmount;
    private BigDecimal monthlySettlementAmount;

    public PGReportResponseDto(
            Long accountDepositTypeId,
            String customerName,
            String customerEmail,
            Long receiptNo,
            Long monthlyCounts,
            BigDecimal monthlyTotalAmount,
            BigDecimal monthlyFeeJPY,
            BigDecimal monthlyTotalPaymentAmount,
            BigDecimal monthlySettlementAmount
    ) {
        this.accountDepositTypeId = accountDepositTypeId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.receiptNo = receiptNo;
        this.dailySummaryList = new ArrayList<>();
        this.monthlyCounts = monthlyCounts;
        this.monthlyTotalAmount = monthlyTotalAmount;
        this.monthlyFeeJPY = monthlyFeeJPY;
        this.monthlyTotalPaymentAmount = monthlyTotalPaymentAmount;
        this.monthlySettlementAmount = monthlySettlementAmount;
    }
}
