///**
// * 개발자 : 한서흔
// * 개발일 : 2025년 06월 04일
// * 개발목적 : Bank Deposit 데이터 관리를 위한 DTO 클래스.
// * 참고 :
// * 수정사항 :
// 1. 수정자 / 일자 : 한서흔 / 2025년 07월 01일
// - 내용 : Branch 속성 삭제.
// 2. 수정자 / 일자 : 최유진 / 2025년 07월 10일
// - 내용 : reason을 String 필드로 변경.
// 3. 수정자 / 일자 : 한서흔 / 2025년 07월 15일
// - 내용 : memo 필드 추가.
// 4. 수정자 / 일자 : 김연주 / 2025년 08월 14일
// - 내용 : @NoAngleBrackets 추가하여 HTML 태그 입력 방지
// */
//package com.nnp.qsremit.controller.pgManagement.bankDepositManagement.dto;
//
//import com.nnp.nextqsremit_core.Entity.pgManagement.ECCustomer.ECType;
//import com.nnp.nextqsremit_core.Entity.pgManagement.bankDeposit.StatusType;
//import com.nnp.nextqsremit_core.validation.annotation.NoAngleBrackets;
//import jakarta.persistence.EnumType;
//import jakarta.persistence.Enumerated;
//import lombok.*;
//
//import java.math.BigDecimal;
//import java.time.OffsetDateTime;
//
//@Data
//@Getter
//@Setter
//@Builder
//@AllArgsConstructor
//@NoAngleBrackets()
//public class BankDepositForm {
//    private Long id;
//    private String bankName;
//    private String accountNo;
//    private String holderName;
//    private OffsetDateTime depositDate;
//    private BigDecimal amount;
//
//    @Enumerated(EnumType.STRING)
//    private ECType type;
//
//    private String sender;
//    private String senderType;
//    private String senderName;
//    private String reason;
//    private String receiver;
//    private String receiverType;
//    private String companyName;
//    private String companyAddress;
//
//    private BigDecimal settlement;
//    private BigDecimal settlementAmount;
//    private BigDecimal payout;
//    private BigDecimal payoutAmount;
//
//    private String reference;
//
//    @Enumerated(EnumType.STRING)
//    private StatusType status;
//
//    private String memo;
//}
