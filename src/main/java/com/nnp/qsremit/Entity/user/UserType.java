/**
 * 개발자 : 김연주
 * 개발일 : 2025년 01월 17일
 * 개발목적 : 사용자 타입(UserType)을 정의하여 시스템 내에서 사용자 권한과 역할을 구분하기 위해 사용.
 * 참고 :
 * 수정사항 :
 1. 수정자 / 일자 : 김연주 / 2025년 05월 26일
 - 내용 : EC 권한 추가
 2. 수정자 / 일자 : 한서흔 / 2025년 09월 04일
 - 내용 : EC Admin 권한 추가.
 3. 수정자 / 일자 : 김연주 / 2025년 10월 14일
 - 내용 : REMIT_ADMIN 권한 추가.
 */
package com.nnp.qsremit.Entity.user;

public enum UserType {
	SUPER_ADMIN, ADMIN, REMIT_ADMIN, SUPER_AGENT, AGENT, EC, EC_ADMIN
}
