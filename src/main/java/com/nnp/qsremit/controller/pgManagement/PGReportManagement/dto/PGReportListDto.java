/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 09월 11일
 * 개발목적 : PG Report Management 메인 화면 정보 조회를 위한 Dto 설계.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 한서흔 / 2025년 09월 16일
 - 내용 : BigDecimal 변경.
 */

package com.nnp.qsremit.controller.pgManagement.PGReportManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PGReportListDto {
    private Long accountDepositTypeId;
    private String customerType;
    private String customerName;
    private String customerEmail;
    private BigDecimal monthlySettlementAmount;
    private Long receiptNo;
}
