///**
// * 개발자 : 한서흔
// * 개발일 : 2025년 05월 29일
// * 개발목적 : EC Customer 데이터 관리를 위한 DTO 클래스.
// * 참고 :
// * 수정사항 :
// 1. 수정자 : 한서흔 / 일자 : 2025년 06월 04일
// - 내용 : 클래스 이름 변경 반영(CreateECCustomerFormDto -> ECCustomerForm) 및 id 추가
// 2. 수정자 / 일자 : 한서흔 / 2025년 07월 01일
// - 내용 : Branch 속성 삭제.
// 3. 수정자 / 일자 : 한서흔 / 2025년 07월 02일
// - 내용 : ecStatus 속성 추가.
// 4. 수정자 / 일자 : 최유진 / 2025년 07월 10일
// - 내용 : reason을 String 필드로 변경.
// 4. 수정자 / 일자 : 김연주 / 2025년 08월 14일
// - 내용 : @NoAngleBrackets 추가하여 HTML 태그 입력 방지
// */
//
//package com.nnp.qsremit.controller.pgManagement.ECCustomerManagement.dto;
//
//import com.nnp.nextqsremit_core.Entity.pgManagement.ECCustomer.ECStatus;
//import com.nnp.nextqsremit_core.Entity.pgManagement.ECCustomer.ECType;
//import com.nnp.nextqsremit_core.validation.annotation.NoAngleBrackets;
//import jakarta.persistence.EnumType;
//import jakarta.persistence.Enumerated;
//import lombok.*;
//
//import java.time.OffsetDateTime;
//
//@Data
//@Getter
//@Setter
//@Builder
//@AllArgsConstructor
//@NoAngleBrackets()
//public class ECCustomerForm {
//    private Long id;
//    private String ecBankName;
//    private String ecAccountNo;
//    private String ecHolderName;
//
//    @Enumerated(EnumType.STRING)
//    private ECType ecType;
//
//    private String ecSenderType;
//    private String ecReason;
//    private String ecReceiver;
//    private String ecReceiverType;
//    private String ecCompanyName;
//    private String ecCompanyAddress;
//
//    @Enumerated(EnumType.STRING)
//    private ECStatus ecStatus;
//
//    private OffsetDateTime createdAt;
//}
