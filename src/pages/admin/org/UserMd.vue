<script setup>
import {ref, reactive, onMounted} from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false);
const committing = ref(false);
const formRef = ref();
const formData = reactive({
	// 基础
	name: '',
	deptId: '',
	positionId: '',
	phone: '',
	sex: '',
	workNumber: '',
	boardDate: '',
	officePhone: '',
	email: '',
	mailbox: '',
	exigencyUser: '',
	exigencyPhone: '',
	address: '',
	legalSendAddr: '',
	// 身份信息
	idCard: '',
	birthday: '',
	idCardExpireDate: '',
	idCardAddr: '',
	// 劳动合同
	isContract: '',
	contractBd: '',
	contractEd: '',
	// 银行卡信息 json
	bankCards: '',
	// 毕业信息
	education: '',
	major: '', //专业
	school: '',
	graduationDate: '',
	remark: ''
});
const rules = reactive({
	name: [{required: true, message: '请输入姓名', trigger: 'change'}],
	phone: [{required: true, message: '请输入手机号', trigger: 'change'}],
	positionId: [{required: true, message: '请选择职位', trigger: 'change'}],
	deptId: [{required: true, message: '请选择部门', trigger: 'change'}],
	sex: [{required: true, message: '请选择性别', trigger: 'change'}]
})

const toCommit = () => {

}
</script>

<template lang="pug">
	.info-container(v-loading="loading")
		.info-header
			._title 新增员工
			._btn
				el-button(plain @click="router.go(-1)") 取 消
				el-button(type="primary" :loading="committing" @click="toCommit(formRef)") 保 存
		.info-body
			el-form(
				ref="formRef"
				:model="formData"
				:rules="rules"
				label-position="top"
				@submit.prevent
				label-width="auto"
			)
				.info-block
					._title 基础信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名" prop="name")
								el-input(v-model="formData.name" placeholder="请输入" maxlength="16")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="所属部门" prop="deptId")
								el-input(v-model="formData.deptId")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="职位" prop="positionId")
								el-input(v-model="formData.positionId")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="手机号" prop="phone")
								el-input(v-model="formData.phone" placeholder="请输入" maxlength="11")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="性别" prop="sex")
								el-select(v-model="formData.sex" placeholder="请选择")
									el-option(label="男" value="男")
									el-option(label="女" value="女")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="工号")
								el-input(v-model="formData.workNumber" placeholder="请输入" maxlength="16")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="入职时间")
								el-date-picker(v-model="formData.boardDate"
									style="width: 100%"
									type="date"
									placeholder="请选择"
									format="YYYY年MM月DD日"
									value-format="X")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="办公电话")
								el-input(v-model="formData.officePhone" placeholder="请输入" maxlength="11")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="个人邮箱")
								el-input(v-model="formData.email" placeholder="请输入" maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="企业邮箱")
								el-input(v-model="formData.mailbox" placeholder="请输入" maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="紧急联系人")
								el-input(v-model="formData.exigencyUser" placeholder="请输入" maxlength="16")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="紧急联系人电话")
								el-input(v-model="formData.exigencyPhone" placeholder="请输入" maxlength="11")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="详细住址")
								el-input(v-model="formData.address" placeholder="请输入" maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="法律文书送达详细地址")
								el-input(v-model="formData.legalSendAddr" placeholder="请输入" maxlength="64")
				.info-block
					._title 身份信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="身份证号")
								el-input(v-model="formData.idCard" placeholder="请输入" maxlength="18")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="出生日期")
								el-input(v-model="formData.birthday" placeholder="请输入" maxlength="10")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="身份证到期日期")
								el-date-picker(v-model="formData.idCardExpireDate"
									style="width: 100%"
									type="date"
									placeholder="请选择"
									format="YYYY-MM-DD"
									value-format="YYYY-MM-DD")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="身份证详细地址")
								el-input(v-model="formData.idCardAddr" placeholder="请输入" maxlength="64")
				.info-block
					._title 劳动合同信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
				.info-block
					._title 银行卡信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
				.info-block
					._title 学历和其他
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="姓名")
								el-input(v-model="formData.name")

</template>

<style scoped lang="scss">

</style>
