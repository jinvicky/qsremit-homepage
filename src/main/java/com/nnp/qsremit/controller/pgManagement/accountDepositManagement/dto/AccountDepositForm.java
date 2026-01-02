/**
 * 개발자 : 최유진
 * 개발일 : 2025년 05월 30일
 * 개발목적 : Account Deposit 데이터의 조회 및 업데이트에 사용하는 dto 클래스.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 최유진 / 2025년 05월 30일
 - 내용 : Entity 매핑용 내장 메소드 제거.
 2. 수정자 / 일자 : 한서흔 / 2025년 07월 07일
 - 내용 : form 양식 추가.
 3. 수정자 / 일자 : 한서흔 / 2025년 07월 08일
 - 내용 : customerNum Long > String 타입 변경.
 4. 수정자 / 일자 : 김연주 / 2025년 08월 14일
 - 내용 : @NoAngleBrackets 추가하여 HTML 태그 입력 방지
 */
package com.nnp.qsremit.controller.pgManagement.accountDepositManagement.dto;

import com.nnp.qsremit.validation.annotation.NoAngleBrackets;
import lombok.*;

import java.time.OffsetDateTime;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoAngleBrackets()
public class AccountDepositForm {
    private Long id;
    private OffsetDateTime depositDate;
    private String depositName;
    private Long depositAmount;
    private String customerType;
    private String customerNum;
    private String customerName;
//    private Gender customerGender;
    private OffsetDateTime customerBirthDate;
    private String customerAddress;
    private String memo;

    private OffsetDateTime createdAt;

    private String bank;
    private String accountName;
}
