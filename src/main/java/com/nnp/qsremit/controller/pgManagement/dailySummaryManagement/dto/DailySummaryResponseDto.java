/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 09월 04일
 * 개발목적 : Daily Summary Management 데이터 조회를 위한 통계 dto 설계.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 한서흔 / 2025년 09월 10일
 - 내용 : 순서 정렬을 위한 orderNo 추가.
 2. 수정자 / 일자 : 한서흔 / 2025년 09월 11일
 - 내용 : depositAt 필드 추가.
 3. 수정자 / 일자 : 한서흔 / 2025년 09월 16일
 - 내용 : BigDecimal 변경.
 4. 수정자 / 일자 : 한서흔 / 2025년 09월 24일
 - 내용 : Builder 삭제.
 5. 수정자 / 일자 : 한서흔 / 2025년 09월 25일
 - 내용 : New Bank Deposit 자동 데이터 연결을 위한 dto 변경.
 */

package com.nnp.qsremit.controller.pgManagement.dailySummaryManagement.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class DailySummaryResponseDto {
    private Long id;
    private Long accountDepositTypeId;
    private String customerType;
    private Long orderNo;

    // EC 고객사 정보
    private Long ecCustomerId;
    private String ecCompanyName;
    private String ecBankName;
    private String ecAccountNo;
    private String ecHolderName;

    // 집계 정보
    private Long counts;
    private BigDecimal totalAmount;

    private BigDecimal feeRate;
    private BigDecimal feeJPY;
    private BigDecimal totalRefundAmount;
    private BigDecimal totalPaymentAmount;
    private BigDecimal exchangeRate;
    private BigDecimal settlementAmount;

    private OffsetDateTime createdAt;
    private OffsetDateTime depositAt;

    public DailySummaryResponseDto(
            Long id,
            Long accountDepositTypeId,
            String customerType,
            Long orderNo,
            Long ecCustomerId,
            String ecCompanyName,
            String ecBankName,
            String ecAccountNo,
            String ecHolderName,
            Long counts,
            BigDecimal totalAmount,
            BigDecimal feeRate,
            BigDecimal feeJPY,
            BigDecimal totalPaymentAmount,
            BigDecimal exchangeRate,
            BigDecimal settlementAmount,
            OffsetDateTime createdAt,
            OffsetDateTime depositAt
    ) {
        this.id = id;
        this.accountDepositTypeId = accountDepositTypeId;
        this.customerType = customerType;
        this.orderNo = orderNo;
        this.ecCustomerId = ecCustomerId;
        this.ecCompanyName = ecCompanyName;
        this.ecBankName = ecBankName;
        this.ecAccountNo = ecAccountNo;
        this.ecHolderName = ecHolderName;
        this.counts = counts;
        this.totalAmount = totalAmount;
        this.feeRate = feeRate;
        this.feeJPY = feeJPY;
        this.totalPaymentAmount = totalPaymentAmount;
        this.exchangeRate = exchangeRate;
        this.settlementAmount = settlementAmount;
        this.createdAt = createdAt;
        this.depositAt = depositAt;
    }
}
