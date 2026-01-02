/**
* 개발자 : 김연주
* 개발일 : 2025년 01월 17일
* 개발목적 :
* 사용자 정보를 데이터베이스에 저장하고 관리하기 위한 엔티티 클래스입니다.
* 주요 역할 :
* - 사용자 데이터를 저장 및 관리 (UserEntity 객체로 매핑)
* - 사용자 정보의 생성, 업데이트, 삭제(soft-delete) 등의 동작을 처리
* - Spring Data JPA를 기반으로 `users` 테이블과 매핑
* 주요 구성 :
* - `id` : 고유 식별자, Primary Key
* - `userType` : 사용자 타입(Enum)
* - `userId` : 사용자의 고유 아이디
* - `password` : 암호화된 비밀번호 저장
* - `name`, `email`, `mobile` : 개인 정보 필드
* - `transactionReport` : 사용자 거래 보고 활성 상태
* - `createAt`, `updateAt` : 생성 및 업데이트 시간
* - `deleted` : soft delete 상태를 나타내는 플래그
* 주요 메서드 :
* 1. `updateEntity` : `CreateUserFormDto`의 데이터를 받아 사용자 정보를 업데이트하며, 암호화된 비밀번호를 저장.
* 2. `deleteEntity` : 사용자를 삭제된 상태로 설정(soft-delete)하여 데이터를 유지하면서 비활성화.
* 참고 :
* - `@Entity`, `@Table` : 데이터베이스 매핑을 정의
* - `@Builder`, `@AllArgsConstructor`, `@NoArgsConstructor` : 객체 생성을 유연하게 지원
* - `@Enumerated(EnumType.STRING)` : Enum 타입을 STRING으로 데이터베이스에 저장
* 수정사항 :
 1. 수정자 / 일자 : 김연주 / 2025년 03월 13일
 - 내용 : 사용자 업데이트(updateUser) 메서드에서 비밀번호를 암호화 처리하도록 수정.
 2. 수정자 / 일자 : 김연주 / 2025년 03월 17일
 - 내용 : 비밀번호 변경 기능의 가독성과 유지보수를 위해 로직을 별도 메서드/클래스로 분리
 3. 수정자 / 일자 : 김연주 / 2025년 03월 24일
 - 내용 : LocalDateTime에서 OffsetDateTime으로 변경
 기존 LocalDateTime은 시간대(time zone) 정보를 포함하지 않아 DB 시간과 로컬 시간이
 달라지는 문제가 발생했음. OffsetDateTime을 사용하여 시간대 정보를 저장함으로써,
 DB와 로컬 시간 차이를 해결하고 일관된 시간 데이터를 관리할 수 있도록 개선함.
 4. 수정자 / 일자 : 김연주 / 2025년 04월 02일
 - 내용: 이메일 AES 암호화로 인한 중복 체크 문제 해결을 위해 이메일 해시값 저장 필드 추가 및 create 메서드를 통한 등록 로직 개선
 5. 수정자 / 일자 : 김연주 / 2025년 04월 17일
 - 내용: 로그인 실패 카운트 필드 추가(accountLocked), transactionReport 필드 기본값 설정
 6. 수정자 / 일자 : 김연주 / 2025년 05월 12일
 - 내용 : 암호화 미적용으로 불필요해진 hashed 필드 삭제
 7. 수정자 / 일자 : 한서흔 / 2025년 06월 26일
 - 내용 : 중간 테이블 MailingUserListEntity를 위한 일대다 연결 코드 추가.
 8. 수정자 / 일자 : 김연주 / 2025년 09월 30일
 - 내용 : 비밀번호 리셋 확인 필드 추가
*/
package com.nnp.qsremit.Entity.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserEntity {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
    private UserType userType;

	@Column(unique = true)
	private String userId;

	private String password;

	private String name;

	@Column(unique = true)
	private String email;

	private String mobile;

	@Builder.Default
	private boolean transactionReport = false;

	@Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
	private OffsetDateTime createAt;

	@Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
	private OffsetDateTime updateAt;

	@Builder.Default
	private boolean deleted = false;

	private boolean isEmailVerified; // 이메일 인증

	@Builder.Default
	private boolean accountLocked = false;

	@Builder.Default
	private boolean resetPassword = false;

	public void deleteEntity() {
		this.deleted = true;
		this.updateAt = OffsetDateTime.now();
	}

	public void changePassword(String encode) {
		this.password = encode;
	}

	public void updateTimestamp() {
		this.updateAt = OffsetDateTime.now();
	}

}
