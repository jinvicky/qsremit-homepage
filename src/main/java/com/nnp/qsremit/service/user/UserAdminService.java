/**
* 개발자 : 김연주
* 개발일 : 2025년 01월 17일
* 개발목적 : 사용자 관리 관련 비즈니스 로직을 처리하는 서비스 클래스.
* 수정사항 :
 1. 수정자 / 일자 : 김연주 / 2025년 03월 13일
 - 내용 : 사용자 업데이트(updateUser) 메서드에서 비밀번호를 암호화 처리하도록 수정.
 2. 수정자 / 일자 : 김연주 / 2025년 03월 14일
 - 내용 : 아이디 중복 예외 처리 구현. 중복된 아이디 등록 시 예외 발생하도록 수정.
 3. 수정자 / 일자 : 김연주 / 2025년 03월 17일
 - 내용 : 비밀번호 변경 기능의 가독성과 유지보수를 위해 로직을 별도 메서드/클래스로 분리.
 4. 수정자 / 일자 : 김연주 / 2025년 03월 24일
 - 내용 : LocalDateTime에서 OffsetDateTime으로 변경.
 기존 LocalDateTime은 시간대(time zone) 정보를 포함하지 않아 DB 시간과 로컬 시간이
 달라지는 문제가 발생했음. OffsetDateTime을 사용하여 시간대 정보를 저장함으로써,
 DB와 로컬 시간 차이를 해결하고 일관된 시간 데이터를 관리할 수 있도록 개선함.
 5. 수정자 / 일자 : 김연주 / 2025년 03월 27일
 - 내용 : 데이터 암호화 및 복호화.
 6. 수정자 / 일자 : 김연주 / 2025년 04월 02일
 - 내용 : userId 및 Email 중복 체크 로직 추가 및 Email의 해시 값 저장 기능 구현.
 7. 수정자 / 일자 : 김연주 / 2025년 04월 11일
 - 내용 : 이메일 중복 체크 오류 해결 (hashed_email 평문 저장으로 변경)
 - 기존에는 hashed_email 필드에 암호화된 값이 저장되어 중복 체크가 불가능했음.
 - 중복 체크를 위해 평문 이메일을 저장하도록 변경.
 8. 수정자 / 일자 : 최유진 / 2025년 04월 12일
 - 내용 : User 정보 수정 불가 오류 해결.
 - email이 변경된 경우에만 중복 체크를 수행하도록 수정.
 9. 수정자 / 일자 : 김연주 / 2025년 04월 21일
 - 내용 : getAllUser메서드 UserProjection를 반환하는 repository 메서드로 변경
 10. 수정자 / 일자 : 김연주 / 2025년 04월 22일
 - 내용 : 임시 비밀번호 이메일로 전송 로직 구현(임시 비밀번호 생성 후 업데이트)
 11. 수정자 / 일자 : 김연주 / 2025년 05월 09일
 - 내용 : 암호화되어 저장되고 있는 특정 데이터를 평문으로 저장하도록 변경.
 12. 수정자 / 일자 : 최유진 / 2025년 05월 19일
 - 내용 : 파일명 변경으로 인한 import문 및 변수명 변경.
 13. 수정자 / 일자 : 김연주 / 2025년 05월 26일
 - 내용 : 해시 암호화 제거로 인한 평문 중복 체크 문제 수정.
 14. 수정자 / 일자 : 한서흔 / 2025년 07월 01일
 - 내용 : User 상태 변화에 따른 Report List 데이터 변경을 위한 MailingManagementService 추가.
 15. 수정자 / 일자 : 김연주 / 2025년 07월 04일
 - 내용 : User Role 변경 로직 추가
 16. 수정자 / 일자 : 김연주 / 2025년 07월 15일
 - 내용 : 권한에 따른 사용자 목록 조회 및 상세 조회 로직 추가
 17. 수정자 / 일자 : 김연주 / 2025년 08월 12일
 - 내용 : 이메일로 조회한 사용자 계정 비밀번호 초기화 로직 추가
 18. 수정자 / 일자 : 최유진 / 2025년 08월 13일
 - 내용 : HTML escape 처리 추가
 19. 수정자 / 일자 : 김연주 / 2025년 09월 25일
 - 내용 : 비밀번호 검증 추가
 20. 수정자 / 일자 : 김연주 / 2025년 09월 30일
 - 내용 : 현재 비밀번호 검증 추가, 비밀번호 리셋 로직 user id 추가 검증
 21. 수정자 / 일자 : 최유진 / 2025년 10월 31일
 - 내용 : SMS/Email/Push 알림 발송 기능 api 서버로 이전 및 async 처리
*/
package com.nnp.qsremit.service.user;

import com.nnp.qsremit.Entity.user.UserEntity;
import com.nnp.qsremit.Entity.user.UserType;
import com.nnp.qsremit.dto.user.CreateUserFormDto;
import com.nnp.qsremit.dto.user.UserProjection;
import com.nnp.qsremit.repository.user.UserRepository;
import com.nnp.qsremit.service.util.HttpUtils;
import com.nnp.qsremit.service.verification.UserVerificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAdminService {
//	@Value("${email.support.username}")
//	private String supportUsername;
//	@Value("${email.support.password}")
//	private String supportPassword;

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final UserRoleService userRoleService;
	private final UserService userService;
	private final HttpUtils httpUtils;
	private final UserVerificationService userVerificationService;


	public List<UserProjection> getAllUser(UserType userType) {

		if (UserType.SUPER_ADMIN.equals(userType)) {
			return userRepository.findByDeletedFalseOrderByCreateAtDesc();
		}

		return userRepository.findByDeletedFalseAndUserTypeNotOrderByCreateAtDesc(UserType.SUPER_ADMIN);
	}

	public CreateUserFormDto getUserByIdToUserForm(Long id, UserType userType) {
		UserEntity userEntity;

		if (UserType.SUPER_ADMIN.equals(userType)) {
			userEntity = userVerificationService.findById(id);
		} else {
			userEntity = userVerificationService.findByIdAndUserTypeNot(id, UserType.SUPER_ADMIN);
		}

		return CreateUserFormDto.builder()
				.id(userEntity.getId())
				.userId(userEntity.getUserId())
				.password(userEntity.getPassword())
				.userType(userEntity.getUserType())
				.name(userEntity.getName())
				.mobile(userEntity.getMobile())
				.email(userEntity.getEmail())
				.transactionReport(userEntity.isTransactionReport())
				.createAt(userEntity.getCreateAt())
				.build();
	}

	public void createUser(CreateUserFormDto dto) throws Exception {
		String rawPassword = dto.getPassword();
		CreateUserFormDto escapedDto = (CreateUserFormDto) httpUtils.escapeAllStrings(dto);
		escapedDto.setPassword(rawPassword);

		// 중복 체크: 사용자 ID
		if (existsByUserId(escapedDto.getUserId())) {
			throw new Exception("User ID already exists");
		}

		// 중복 체크: 이메일
		if (existsByEmail(escapedDto.getEmail())) {
			throw new Exception("Email already exists");
		}

		// 비밀번호 검증
		boolean valid = isValidPassword(escapedDto.getPassword());
		if (!valid) {
			throw new Exception("Invalid password");
		}

		UserEntity userEntity = UserEntity.builder()
				.userId(escapedDto.getUserId())
				.name(escapedDto.getName())
				.userType(escapedDto.getUserType())
				.password(passwordEncoder.encode(escapedDto.getPassword()))
				.email(escapedDto.getEmail())
				.mobile(escapedDto.getMobile())
				.transactionReport(escapedDto.isTransactionReport())
				.createAt(OffsetDateTime.now())
				.isEmailVerified(true)
				.build();
		userRepository.save(userEntity);

	}

	public boolean existsByUserId(String userId) {
		return userRepository.existsByUserId(userId);
	}

	// 이메일 인증 로직 필요
	public boolean existsByEmail(String email) {
		if (email == null || email.trim().isEmpty()) {
			return false;
		}
		return userRepository.existsByEmail(email.trim());

	}


	@Transactional
	public void updateUser(CreateUserFormDto form, Long id, String adminId) throws Exception {
		String rawPassword = form.getPassword().trim();
		String rawCurrentPassword = form.getCurrentPassword().trim();

		UserEntity userEntity = userVerificationService.findById(id);

		if (form.getCurrentPassword() != null && !form.getCurrentPassword().isEmpty()) {
			if (!passwordEncoder.matches(rawCurrentPassword, userEntity.getPassword())) {
				throw new Exception("Current Password not correct");
			}
		}

		form = (CreateUserFormDto) httpUtils.escapeAllStrings(form);
		form.setPassword(rawPassword);

		// 이메일 암호화 및 해시 (변경된 경우에만 수행)
		if (form.getEmail() != null && !form.getEmail().isEmpty()) {
			// 중복체크
			if (!form.getEmail().trim().equals(userEntity.getEmail())
					&& existsByEmail(form.getEmail())) {
				throw new Exception("Email already exists");
			}
			userEntity.setEmail(form.getEmail());
		}

		// 휴대폰 번호 암호화 (변경된 경우에만 수행)
		if (form.getMobile() != null && !form.getMobile().isEmpty()) {
			userEntity.setMobile(form.getMobile().trim());
		}

		// 비밀번호 검증
		boolean valid = isValidPassword(form.getPassword());
		if (!valid) {
			throw new Exception("Invalid password");
		}

		// 기타 정보 업데이트 (이름, 트랜잭션 리포트 여부)
		userEntity.setName(form.getName().trim());
		userEntity.setTransactionReport(form.isTransactionReport());

		if (userEntity.getUserType() != form.getUserType()) {
			userRoleService.updateUserRole(userEntity, form.getUserType());
		}

		// 비밀번호 변경 (null 또는 빈 문자열이 아닐 때만)
		if (form.getPassword() != null && !form.getPassword().isEmpty()) {
			userEntity.changePassword(passwordEncoder.encode(form.getPassword().trim()));
		}

		// 업데이트 시간 갱신
		userEntity.updateTimestamp();

	}

	@Transactional
	public void deleteUser(Long id) {
		UserEntity userEntity = userRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));


		userEntity.deleteEntity();
	}

	public boolean isValidPassword(String password){
		log.info("isValidPassword: {}", password);
		if (password == null || password.isBlank()) return true;

		String PASSWORD_PATTERN = "^(?=.*\\d)(?=.*[^A-Za-z0-9]).{14,}$";
		Pattern pattern = Pattern.compile(PASSWORD_PATTERN);


		if (!pattern.matcher(password).matches()) {
			return false;
		}

		if (password.matches(".*(012|123|234|345|456|567|678|789|890).*")) {
			return false;
		}

		return true;
	}
}
