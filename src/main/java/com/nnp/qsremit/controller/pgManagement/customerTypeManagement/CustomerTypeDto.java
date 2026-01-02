/**
 * 개발자 : 한서흔
 * 개발일 : 2025년 06월 25일
 * 개발목적 : Account Deposit의 Customer Type 관리를 위한 DTO 생성.
 * 참고 :
 * 수정사항 :
 2. 수정자 / 일자 : 한서흔 / 2025년 07월 07일
 - 내용 : orderNo 필드 추가.
 3. 수정자 / 일자 : 김연주 / 2025년 08월 14일
 - 내용 : @NoAngleBrackets 추가하여 HTML 태그 입력 방지
 4. 수정자 / 일자 : 한서흔 / 2025년 09월 02일
 - 내용 : customerEmail 필드 생성, ecCustomer 외래키 연결.
 5. 수정자 / 일자 : 한서흔 / 2025년 09월 03일
 - 내용 : orderNo 타입 변경.
 6. 수정자 / 일자 : 한서흔 / 2025년 09월 11일
 - 내용 : receiptNo, customerName 필드 추가.
 */

package com.nnp.qsremit.controller.pgManagement.customerTypeManagement;

import com.nnp.qsremit.validation.annotation.NoAngleBrackets;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@NoAngleBrackets()
public class CustomerTypeDto {
    private Long orderNo;
    private Long receiptNo;
    private String customerType;
    private String customerEmail;
    private String customerName;
    private Long ecCustomer;
}
