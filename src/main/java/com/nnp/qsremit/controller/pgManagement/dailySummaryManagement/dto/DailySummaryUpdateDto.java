/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 09월 04일
 * 개발목적 : Daily Summary Management 데이터 업데이트를 위한 통계 dto 설계.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 한서흔 / 2025년 09월 09일
 - 내용 : EC Customer 업데이트 필드 삭제.
 2. 수정자 / 일자 : 한서흔 / 2025년 09월 11일
 - 내용 : depositAt 필드 추가
 3. 수정자 / 일자 : 한서흔 / 2025년 09월 24일
 - 내용 : counts, totalAmount 필드 추가.
 */

package com.nnp.qsremit.controller.pgManagement.dailySummaryManagement.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
public class DailySummaryUpdateDto {
    private Long id;
    private Long counts;
    private Long totalAmount;
    private BigDecimal feeRate;
    private BigDecimal exchangeRate;
    private OffsetDateTime depositAt;
}
