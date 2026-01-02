/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 09월 04일
 * 개발목적 : Daily Summary Management 일별 입금 내역 조회를 위한 통계 dto 설계.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 작성자 / 2025년 00월 00일
 - 내용 :
 */

package com.nnp.qsremit.controller.pgManagement.dailySummaryManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DailySummaryTypeResponseDto {
    private OffsetDateTime depositDate;
    private String depositName;
    private Long depositAmount;
    private BigDecimal feeRate;
}
