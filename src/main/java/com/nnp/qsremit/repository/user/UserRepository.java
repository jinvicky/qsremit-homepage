/**
 * 개발자 : 김연주
 * 개발일 : 2024년 12월 26일
 * 개발목적 :
 * SPRING DATA JPA를 활용하여 사용자 데이터베이스 작업을 처리하는 REPOSITORY 인터페이스입니다.
 * 주요 역할 :
 * - 사용자 정보 CRUD 쿼리를 정의하고 수행
 * - 사용자 데이터를 효율적으로 조회하기 위한 커스텀 쿼리 제공
 * - JPAREPOSITORY를 상속받아 기본 CRUD 메서드 제공
 * 참고 :
 * - `@REPOSITORY` : SPRING BEAN으로 등록될 클래스를 선언.
 * - `@QUERY` : 커스텀 JPQL(QUERY) 정의를 통해 특정 비즈니스 요구사항을 처리.
 * - `JPAREPOSITORY<USERENTITY, LONG>` : USERENTITY를 기반으로 기본 제공 CRUD 기능 활용.
 * 수정사항 :
 1. 수정자 / 일자 : 김연주 / 2025년 03월 13일
 - 내용 : `FINDBYDELETED` 메서드에서 USERRESPONSEDTO에 맞춘 데이터 반환 및 정렬 조건 추가.
 `FINDBYIDWITHROLE` 메서드 추가로 특정 사용자 정보를 ROLE과 함께 조회하는 기능 구현.
 2. 수정자 / 일자 : 김연주 / 2025년 03월 14일
 - 내용 :  USERID로 사용자 존재 여부를 확인하는 EXISTSBYUSERID 메서드 추가
 3. 수정자 / 일자 : 김연주 / 2025년 03월 17일
 - 내용 :  FINDBYDELETED 메소드 SUPER_ADMIN 조회 대상 제외
 4. 수정자 / 일자 : 김연주 / 2025년 03월 24일
 - 내용 : LOCALDATETIME에서 OFFSETDATETIME으로 변경
 기존 LOCALDATETIME은 시간대(TIME ZONE) 정보를 포함하지 않아 DB 시간과 로컬 시간이
 달라지는 문제가 발생했음. OFFSETDATETIME을 사용하여 시간대 정보를 저장함으로써,
 DB와 로컬 시간 차이를 해결하고 일관된 시간 데이터를 관리할 수 있도록 개선함.
 5. 수정자 / 일자 : 김연주 / 2025년 04월 02일
 - 내용 : 이메일 중복 체크를 위한 메서드 구현
 6. 수정자 / 일자 : 김연주 / 2025년 04월 21일
 - 내용 : UserProjection 도입으로 findByDeleted 대체(findByDeletedFalseAndUserTypeNotOrderByCreateAtDesc)
 7. 수정자 / 일자 : 김연주 / 2025년 07월 13일
 - 내용 : 사용자 유형(UserType)을 기준으로 SUPER_ADMIN 목록 조회 메서드 추가
 8. 수정자 / 일자 : 김연주 / 2025년 07월 15일
 - 내용 : 권한에 따른 사용자 목록 및 상세 조회 로직 추가
 9. 수정자 / 일자 : 김연주 / 2025년 08월 12일
 - 내용 : 이메일로 사용자 조회 로직 추가
 */
package com.nnp.qsremit.repository.user;

import com.nnp.qsremit.Entity.user.UserEntity;
import com.nnp.qsremit.Entity.user.UserType;
import com.nnp.qsremit.dto.user.UserProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

	List<UserProjection> findByDeletedFalseAndUserTypeNotOrderByCreateAtDesc(UserType userType);

	List<UserProjection> findByDeletedFalseOrderByCreateAtDesc();


	@Query("SELECT u FROM UserEntity u WHERE u.userId = :userId")
	Optional<UserEntity> findByIdWithRole(@Param("userId") String userId);

    boolean existsByUserId(String userId);

	boolean existsByEmail(String Email);

    Optional<UserEntity> findByUserId(String userId);

	Optional<UserEntity> findByIdAndUserTypeNot(Long userId, UserType userType);

	@Query("SELECT u.name FROM UserEntity u WHERE u.userType = :userType AND u.deleted = false AND u.accountLocked = false")
	List<String> findNamesByUserType(@Param("userType") UserType userType);

	Optional<UserEntity> findByUserIdAndEmail(String userId, String email);

	List<UserEntity> findByTransactionReportTrue();

}
