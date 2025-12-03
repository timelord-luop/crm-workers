<script setup>
import {ref, reactive, onMounted, nextTick} from 'vue'
import {useRouter} from 'vue-router'
import Http from "@/plugins/http.js";
import {ApiDeptSimpleList, ApiPostSimpleList, ApiUserAdd, ApiUserUpdate} from "@/configuration/api/users.js";
import BankDialog from "@/components/BankDialog.vue";
import CommonUtil from "@/assets/js/commonUtil.js";

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
	contractCompany: '',
	insuredCompany: '',
	// 银行卡信息 json
	bankCards: [],
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
const positionList = ref([]);
const deptList = ref([]);

onMounted(() => {
	getPositionList();
	getDeptList();
})

const getPositionList = () => {
	Http.request(ApiPostSimpleList).then(res => {
		positionList.value = res.list
	})
}
const getDeptList = () => {
	Http.request(ApiDeptSimpleList).then(res => {
		deptList.value = res.list
	})
}
// 银行弹窗
const dialogVisible = ref(false);
const bankData = ref({});
const addBank = (index) => {
	bankData.value = {
		index: index || null,
		act: index >= 0 ? 'insert' : 'add',
		account: '',
		userName: '',
		bankName: '',
		openingBank: '',
		bankCode: '',
		remark: ''
	}
	dialogVisible.value = true
}
const bankEdit = (data, index) => {
	bankData.value = {
		index: index,
		act: 'edit',
		account: data.account,
		userName: data.userName,
		bankName: data.bankName,
		openingBank: data.openingBank,
		bankCode: data.bankCode,
		remark: data.remark
	}
	dialogVisible.value = true;
}
const bankDelete = (index) => {
	formData.bankCards.splice(index, 1)
}
const getBankData = (data) => {
	let bankData = CommonUtil.deepClone(data);
	delete bankData.index;
	delete bankData.act;
	if (data.act === 'add') {
		formData.bankCards.push(bankData)
	}
	if (data.act === 'insert') {
		formData.bankCards.splice(data.index + 1, 0, bankData)
	}
	if (data.act === 'edit') {
		formData.bankCards[data.index] = bankData
	}
}
const toCommit = async (formEl) => {
	await formEl.validate(valid => {
		if (!valid) return CommonUtil.scrollToFirstError();
		let params = getSubmitData();
		committing.value = true;
		const API = params.id ? ApiUserUpdate : ApiUserAdd;
		Http.request(API, params).then(res => {
			committing.value = false;
			router.push({
				path: '/user',
				query: {
					_t: Date.now()
				}
			})
		}).catch(err => {
			console.log(err);
			committing.value = false;
		})
	})
}

const getSubmitData = () => {
	let submitData = CommonUtil.deepClone(formData);
	if (submitData.bankCards.length) {
		submitData.bankCards = JSON.stringify(submitData.bankCards)
	}
	return submitData;
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
								el-cascader(v-model="formData.deptId"
									style="width: 100%"
									:options="deptList"
									:props="{checkStrictly: true, emitPath: false, label: 'name', value: 'id'}"
									filterable,
									:show-all-levels="false"
									clearable)
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="职位" prop="positionId")
								el-select(v-model="formData.positionId" filterable placeholder="请选择" clearable)
									el-option(v-for="item in positionList" :key="item.id" :label="item.name" :value="item.id")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="手机号" prop="phone")
								el-input(v-model="formData.phone" placeholder="请输入" clearable maxlength="11")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="性别" prop="sex")
								el-select(v-model="formData.sex" placeholder="请选择" clearable)
									el-option(label="男" value="男")
									el-option(label="女" value="女")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="工号")
								el-input(v-model="formData.workNumber" placeholder="请输入" clearable maxlength="16")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="入职时间")
								el-date-picker(v-model="formData.boardDate"
									style="width: 100%"
									type="date"
									placeholder="请选择"
									clearable
									format="YYYY年MM月DD日"
									value-format="X")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="办公电话")
								el-input(v-model="formData.officePhone" placeholder="请输入" clearable maxlength="11")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="个人邮箱")
								el-input(v-model="formData.email" placeholder="请输入" clearable maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="企业邮箱")
								el-input(v-model="formData.mailbox" placeholder="请输入" clearable maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="紧急联系人")
								el-input(v-model="formData.exigencyUser" placeholder="请输入" clearable maxlength="16")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="紧急联系人电话")
								el-input(v-model="formData.exigencyPhone" placeholder="请输入" clearable maxlength="11")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="详细住址")
								el-input(v-model="formData.address" placeholder="请输入" clearable maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="法律文书送达详细地址")
								el-input(v-model="formData.legalSendAddr" placeholder="请输入" clearable maxlength="64")
				.info-block
					._title 身份信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="身份证号")
								el-input(v-model="formData.idCard" placeholder="请输入" clearable maxlength="18")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="出生日期")
								el-input(v-model="formData.birthday" placeholder="请输入" clearable maxlength="10")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="身份证到期日期")
								el-date-picker(v-model="formData.idCardExpireDate"
									style="width: 100%"
									type="date"
									placeholder="请选择"
									clearable
									format="YYYY-MM-DD"
									value-format="YYYY-MM-DD")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="身份证详细地址")
								el-input(v-model="formData.idCardAddr" placeholder="请输入" clearable maxlength="64")
				.info-block
					._title 劳动合同信息
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="是否领取劳动合同")
								el-select(v-model="formData.isContract" placeholder="请选择" clearable)
									el-option(label="是" :value="1")
									el-option(label="否" :value="0")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="合同起始日期")
								el-date-picker(v-model="formData.contractBd"
									style="width: 100%"
									type="date"
									placeholder="请选择"
									clearable
									format="YYYY-MM-DD"
									value-format="YYYY-MM-DD")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="合同终止日期")
								el-date-picker(v-model="formData.contractEd"
									style="width: 100%"
									type="date"
									placeholder="请选择"
									clearable
									format="YYYY-MM-DD"
									value-format="YYYY-MM-DD")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="签约单位")
								el-input(v-model="formData.contractCompany" placeholder="请输入" clearable maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="参保单位")
								el-input(v-model="formData.insuredCompany" placeholder="请输入" clearable maxlength="64")
				.info-block
					._title 银行卡信息
					el-table(:data="formData.bankCards" border stripe height="100%")
						template(#empty)
							el-link(type="success" @click="addBank()") 添加银行卡
						el-table-column(label="序号" width="54" type="index" align="center")
						el-table-column(prop="account" label="银行账号")
						el-table-column(prop="userName" label="户名")
						el-table-column(prop="bankName" label="银行名称")
						el-table-column(prop="openingBank" label="开户行")
						el-table-column(prop="bankCode" label="行号")
						el-table-column(prop="remark" label="备注")
						el-table-column(label="操作" width="180")
							template(#default="{row, $index}")
								.tab-link
									el-button(text bg size="small" type="success" @click="addBank($index)") 添加
									el-button(text bg size="small" @click="bankEdit(row, $index)") 编辑
									el-button(text bg size="small" type="danger" @click="bankDelete($index)") 删除
				.info-block
					._title 学历和其他
					el-row(:gutter="30")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="学历")
								el-select(v-model="formData.education" placeholder="请选择" clearable)
									el-option(label="高中及以下" value="高中及以下")
									el-option(label="大专" value="大专")
									el-option(label="本科" value="本科")
									el-option(label="硕士" value="硕士")
									el-option(label="博士及以上" value="博士及以上")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="专业")
								el-input(v-model="formData.major" placeholder="请输入" clearable maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="毕业学校")
								el-input(v-model="formData.school" placeholder="请输入" clearable maxlength="64")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="毕业时间")
								el-date-picker(v-model="formData.graduationDate"
									style="width: 100%"
									type="month"
									placeholder="请选择"
									clearable
									format="YYYY-MM"
									value-format="YYYY-MM")
						el-col(:xs="24" :sm="12" :md="8" :lg="8" :xl="6")
							el-form-item(label="其他备注")
								el-input(v-model="formData.remark" type="textarea" maxlength="255" :rows="3" placeholder="请输入" )
	bank-dialog(v-model:visible="dialogVisible" :bank-data="bankData" @confirm="getBankData")
</template>

<style scoped lang="scss">

</style>
