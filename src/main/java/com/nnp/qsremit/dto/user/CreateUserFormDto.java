/**
 * 개발자 : 김연주
 * 개발일 : 2025년 01월 07일
 * 개발목적 : CreateUserFormDto는 사용자 계정 생성과 관련된 데이터를 관리하기 위한 DTO 클래스입니다.
 *           사용자 유형, 아이디, 비밀번호 및 연락처 정보 등을 포함하여 사용자 생성 입력 데이터를 처리합니다.
 * 참고 :
 * - lombok 라이브러리 사용으로 코드 간소화 (@Getter, @Setter 등)
 * - jakarta.persistence를 사용하여 UserType Enum 타입 매핑
 * - 사용자 생성 관련 DTO로 활용
 * 수정사항 :
 1. 수정자 / 일자 : 김연주 / 2025년 03월 24일
 - 내용 : LocalDateTime에서 OffsetDateTime으로 변경
 기존 LocalDateTime은 시간대(time zone) 정보를 포함하지 않아 DB 시간과 로컬 시간이
 달라지는 문제가 발생했음. OffsetDateTime을 사용하여 시간대 정보를 저장함으로써,
 DB와 로컬 시간 차이를 해결하고 일관된 시간 데이터를 관리할 수 있도록 개선함.
 2. 수정자 / 일자 : 김연주 / 2025년 08월 14일
 - 내용 : @NoAngleBrackets 추가하여 HTML 태그 입력 방지
 */

package com.nnp.qsremit.dto.user;

import com.nnp.qsremit.Entity.user.UserType;
import com.nnp.qsremit.validation.annotation.NoAngleBrackets;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@NoAngleBrackets(excludeFields = { "mobile", "password", "currentPassword"})
public class CreateUserFormDto {
	private Long id;
	
	@Enumerated(EnumType.STRING)
    private UserType userType;
	private String userId;
	private String password;
	private String currentPassword;
	private String name;
	private String email;	
	private String mobile;
	private boolean transactionReport;
	private OffsetDateTime createAt;
}
