<script setup>
import {ref, computed} from 'vue'
// import * as XLSX from 'xlsx'
// import ExcelJS from 'exceljs'
import {Upload, Download, Document, Close} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'
import Http from '@/plugins/http.js'

const props = defineProps({
	isImport: {
		type: Boolean,
		default: false
	},
	excelField: {
		type: Array,
		default: () => []
	},
	exportApi: {
		type: Object,
		default: null
	},
	importApi: {
		type: Object,
		default: null
	},
	/** 导出请求参数（含筛选条件等），通常含较大 rows 以拉全量 */
	exportParams: {
		type: Object,
		default: () => ({})
	},
	/** 导出文件名前缀 */
	exportFileNamePrefix: {
		type: String,
		default: '导出'
	},
	/** 导入模板文件名 */
	templateFileName: {
		type: String,
		default: '导入模板.xlsx'
	},
	dialogTitle: {
		type: String,
		default: '导入'
	},
	/** 导入提交时传给后端的列表字段名，默认 list */
	importListKey: {
		type: String,
		default: 'list'
	}
})

const emit = defineEmits(['importSuccess'])

const exporting = ref(false)
const importing = ref(false)
const importVisible = ref(false)
const fileRef = ref(null)
const selectedFile = ref(null)
const pendingFile = ref(null)
const dragOver = ref(false)

const excelAccept = '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'

function isExcelFile(file) {
	if (!file) return false
	const name = file.name?.toLowerCase() || ''
	return name.endsWith('.xlsx') || name.endsWith('.xls') || /sheet|excel/.test(file.type || '')
}

function assignPickedFile(file) {
	if (!isExcelFile(file)) {
		ElMessage.warning('请上传 .xlsx 或 .xls 格式的 Excel 文件')
		return
	}
	pendingFile.value = file
	selectedFile.value = file.name
	if (fileRef.value) fileRef.value.value = ''
}

const onDragOver = (e) => {
	e.preventDefault()
	dragOver.value = true
}

const onDragLeave = (e) => {
	if (!e.currentTarget.contains(e.relatedTarget)) dragOver.value = false
}

const onDrop = (e) => {
	e.preventDefault()
	dragOver.value = false
	const file = e.dataTransfer?.files?.[0]
	if (file) assignPickedFile(file)
}

const clearPickedFile = () => {
	pendingFile.value = null
	selectedFile.value = null
	if (fileRef.value) fileRef.value.value = ''
}

const nameToKeyMap = computed(() => {
	const m = {}
	for (const f of props.excelField) {
		if (f?.name && f?.key) m[String(f.name).trim()] = f.key
	}
	return m
})

function buildSheetFromRows(list) {
	const header = props.excelField.map(f => f.name)
	const rows = (list || []).map(row =>
		props.excelField.map(f => {
			const v = row?.[f.key]
			if (v === null || v === undefined) return ''
			return v
		})
	)
	return [header, ...rows]
}

const HEADER_BORDER = {
	top: {style: 'thin', color: {argb: 'FF1F3864'}},
	left: {style: 'thin', color: {argb: 'FFD0D7DE'}},
	bottom: {style: 'medium', color: {argb: 'FF1F3864'}},
	right: {style: 'thin', color: {argb: 'FFD0D7DE'}}
}
const CELL_BORDER = {
	top: {style: 'thin', color: {argb: 'FFD0D7DE'}},
	left: {style: 'thin', color: {argb: 'FFD0D7DE'}},
	bottom: {style: 'thin', color: {argb: 'FFD0D7DE'}},
	right: {style: 'thin', color: {argb: 'FFD0D7DE'}}
}

/** 数据行过多时跳过逐格边框，避免生成过慢 */
const MAX_ROWS_FULL_BORDER = 8000

/**
 * 使用 ExcelJS 生成带表头底色、列宽、冻结首行的 xlsx 并触发下载
 * @param {any[][]} aoa 首行为表头，其余为数据
 */
async function downloadStyledWorkbook(aoa, fileName, sheetName = 'Sheet1') {
	const { default: ExcelJS } = await import('exceljs')
	const workbook = new ExcelJS.Workbook()
	workbook.creator = 'CRM'
	workbook.created = new Date()

	const sheet = workbook.addWorksheet(sheetName, {
		views: [
			{
				state: 'frozen',
				ySplit: 1,
				xSplit: 0,
				topLeftCell: 'A2',
				activeCell: 'A2'
			}
		]
	})

	if (!aoa?.length) {
		sheet.addRow([])
	} else {
		const headers = aoa[0].map(c => (c == null ? '' : c))
		const dataRows = aoa.slice(1)

		sheet.addRow(headers)

		const headerRow = sheet.getRow(1)
		headerRow.height = 24
		headerRow.font = {
			name: 'Microsoft YaHei',
			size: 10,
			bold: true,
			color: {argb: 'FFFFFFFF'}
		}
		headerRow.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: {argb: 'FF4472C4'}
		}
		headerRow.alignment = {vertical: 'middle', horizontal: 'center', wrapText: true}

		headers.forEach((h, idx) => {
			const col = sheet.getColumn(idx + 1)
			const headLen = String(h).length
			let sampleMax = headLen
			for (let r = 0; r < dataRows.length; r++) {
				const v = dataRows[r]?.[idx]
				if (v != null && v !== '') {
					sampleMax = Math.max(sampleMax, String(v).length)
				}
				if (r > 400) break
			}
			col.width = Math.min(52, Math.max(20, sampleMax + 8))
		})

		dataRows.forEach(row => {
			sheet.addRow((row || []).map(c => (c == null ? '' : c)))
		})

		const lastRow = sheet.rowCount
		const lastCol = headers.length
		const fullBorder = lastRow <= MAX_ROWS_FULL_BORDER

		for (let c = 1; c <= lastCol; c++) {
			sheet.getCell(1, c).border = HEADER_BORDER
		}

		if (fullBorder) {
			for (let r = 2; r <= lastRow; r++) {
				for (let c = 1; c <= lastCol; c++) {
					const cell = sheet.getCell(r, c)
					cell.border = CELL_BORDER
					cell.alignment = {vertical: 'middle', wrapText: true}
				}
			}
		} else {
			for (let r = 2; r <= lastRow; r++) {
				sheet.getRow(r).alignment = {vertical: 'middle', wrapText: true}
			}
		}
	}

	const buffer = await workbook.xlsx.writeBuffer()
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	})
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = fileName
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}

const handleExport = async () => {
	if (!props.exportApi?.URL) {
		ElMessage.warning('未配置导出接口')
		return
	}
	exporting.value = true
	try {
		const res = await Http.request(props.exportApi, {...props.exportParams})
		let list = res?.list ?? res?.data?.list ?? res?.rows ?? []
		if (!Array.isArray(list) && Array.isArray(res?.data)) list = res.data
		if (!Array.isArray(list)) {
			ElMessage.warning('导出数据格式异常')
			return
		}
		const aoa = buildSheetFromRows(list)
		const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '').slice(0, 14)
		await downloadStyledWorkbook(aoa, `${props.exportFileNamePrefix}_${stamp}.xlsx`, '导出数据')
		ElMessage.success('导出成功')
	} catch (e) {
		console.error(e)
	} finally {
		exporting.value = false
	}
}

const downloadTemplate = async () => {
	if (!props.excelField.length) {
		ElMessage.warning('未配置字段')
		return
	}
	try {
		const header = props.excelField.map(f => f.name)
		const sample = props.excelField.map(() => '')
		const aoa = [header, sample]
		await downloadStyledWorkbook(aoa, props.templateFileName, '导入模板')
	} catch (e) {
		console.error(e)
		ElMessage.error('模板生成失败')
	}
}

const openImportDialog = () => {
	pendingFile.value = null
	selectedFile.value = null
	dragOver.value = false
	importVisible.value = true
	if (fileRef.value) fileRef.value.value = ''
}

const triggerFileInput = () => fileRef.value?.click()

const onFileInputChange = (e) => {
	const file = e.target?.files?.[0]
	if (file) assignPickedFile(file)
}

async function parseExcelToJson(arrayBuffer) {
	// 只有执行此函数时，才会下载 xlsx 的 js 文件
	const XLSX = await import('xlsx')

	const workbook = XLSX.read(arrayBuffer, {type: 'array'})
	const sheetName = workbook.SheetNames[0]
	const sheet = workbook.Sheets[sheetName]
	const matrix = XLSX.utils.sheet_to_json(sheet, {header: 1, defval: ''})
	if (!matrix.length) return []
	const rawHeaders = matrix[0].map(h => String(h ?? '').trim())
	const map = nameToKeyMap.value
	if (!rawHeaders.some(h => map[h])) {
		throw new Error('表头与模板不一致，请使用「下载导入模板」中的列名')
	}
	const result = []
	for (let r = 1; r < matrix.length; r++) {
		const line = matrix[r] || []
		const obj = {}
		let hasVal = false
		rawHeaders.forEach((zh, c) => {
			const key = map[zh]
			if (!key) return
			const val = line[c]
			if (val !== '' && val !== null && val !== undefined) hasVal = true
			obj[key] = val === '' || val === undefined ? null : val
		})
		if (hasVal) result.push(obj)
	}
	return result
}

const submitImport = async () => {
	if (!pendingFile.value) {
		ElMessage.warning('请先选择 Excel 文件')
		return
	}
	if (!props.importApi?.URL) {
		ElMessage.warning('未配置导入接口')
		return
	}
	importing.value = true
	try {
		const buf = await pendingFile.value.arrayBuffer()
		const rows = parseExcelToJson(buf)
		if (!rows.length) {
			ElMessage.warning('未解析到有效数据行')
			return
		}
		const payload = {[props.importListKey]: rows}
		const res = await Http.request(props.importApi, payload)
		importVisible.value = false
		pendingFile.value = null
		selectedFile.value = null
		if (fileRef.value) fileRef.value.value = ''
		dragOver.value = false
		let msg = res.msg;
		let msgType = 'success'
		if (res.errorCount > 0) {
			msg = `${msg}，${JSON.stringify(res.errorMessages)}`
			msgType = res.successCount > 0 ? 'warning' : 'error'
		}
		ElMessage({
			showClose: true,
			message: msg,
			type: msgType
		})
		if (res.successCount > 0) emit('importSuccess')
	} catch (err) {
		const msg = err?.message || err?.msg || (typeof err === 'string' ? err : '')
		if (msg) ElMessage.error(msg)
		console.error(err)
	} finally {
		importing.value = false
	}
}

</script>

<template lang="pug">
	div.export-import-wrap
		el-dropdown(
			v-if="isImport"
			split-button
			plain
			trigger="click"
			:disabled="exporting"
			@click="handleExport"
			style="margin-left: 6px"
		)
			span {{ exporting ? '导出中…' : '导出' }}
			template(#dropdown)
				el-dropdown-item(:icon="Download" @click="openImportDialog") 导入
		el-button(
			v-else
			plain
			:loading="exporting"
			:icon="Upload"
			@click="handleExport"
			style="margin-left: 6px"
		) 导出

		input(
			ref="fileRef"
			type="file"
			:accept="excelAccept"
			style="display: none"
			@change="onFileInputChange"
		)

		el-dialog.import-dialog(
			v-model="importVisible"
			:title="dialogTitle"
			width="520px"
			align-center
			destroy-on-close
			:close-on-click-modal="false"
		)
			.import-dialog-inner
				.import-drop-zone(
					role="button"
					tabindex="0"
					:class="{ 'is-dragover': dragOver, 'has-file': !!pendingFile }"
					@click="triggerFileInput"
					@keydown.enter.prevent="triggerFileInput"
					@keydown.space.prevent="triggerFileInput"
					@dragover.prevent="onDragOver"
					@dragleave.prevent="onDragLeave"
					@drop.prevent="onDrop"
				)
					.drop-zone__icon-wrap
						el-icon.drop-zone__icon
							Upload
					template(v-if="!pendingFile")
						p.drop-zone__title 点击或拖拽文件到此处上传
						p.drop-zone__sub 支持 .xlsx、.xls 格式
					template(v-else)
						.drop-zone__file
							el-icon.file-icon
								Document
							span.file-name(:title="selectedFile") {{ selectedFile }}
							el-button.drop-zone__clear(
								type="danger"
								text
								circle
								size="small"
								:icon="Close"
								@click.stop="clearPickedFile"
							)
				.import-hint
					p.hint-line
						el-link.hint-link(type="primary" :underline="false" @click="downloadTemplate") 下载导入模板
						span ，按模板填写上传；表头须与模板中的
						strong 中文列名
						span 完全一致（列顺序可调整）。
						span.hint-tip 请勿修改模板首行表头文字，以免无法识别
			template(#footer)
				.import-dialog-footer
					el-button(@click="importVisible = false") 取 消
					el-button(type="primary" :loading="importing" :disabled="!pendingFile" @click="submitImport") 开始导入
</template>

<style scoped lang="scss">
.export-import-wrap {
	display: inline-flex;
	align-items: center;
}
.import-dialog {
	:deep(.el-dialog__body) {
		padding-top: 8px;
		padding-bottom: 8px;
	}
}

.import-dialog-inner {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.import-drop-zone {
	position: relative;
	border: 1.5px dashed var(--el-border-color);
	border-radius: 12px;
	padding: 15px 24px 15px;
	text-align: center;
	cursor: pointer;
	background: var(--el-fill-color-blank);
	transition:
		border-color 0.2s ease,
		background-color 0.2s ease,
		box-shadow 0.2s ease;

	&:hover {
		border-color: var(--el-color-primary-light-5);
		background: var(--el-color-primary-light-9);
	}

	&.is-dragover {
		border-color: var(--el-color-primary);
		background: var(--el-color-primary-light-9);
		box-shadow: 0 0 0 3px var(--el-color-primary-light-8);
	}

	&.has-file {
		padding: 28px 20px 24px;
	}
}

.drop-zone__icon-wrap {
	display: flex;
	justify-content: center;
	margin-bottom: 12px;
}

.drop-zone__icon {
	font-size: 48px;
	color: var(--el-color-primary-light-3);
	transition: color 0.2s ease, transform 0.2s ease;
}

.import-drop-zone:hover .drop-zone__icon,
.import-drop-zone.is-dragover .drop-zone__icon {
	color: var(--el-color-primary);
	transform: translateY(-2px);
}

.drop-zone__title {
	margin: 0 0 8px;
	font-size: 15px;
	font-weight: 500;
	color: var(--el-text-color-primary);
	line-height: 1.5;
}

.drop-zone__sub {
	margin: 0;
	font-size: 13px;
	color: var(--el-text-color-secondary);
	line-height: 1.5;
}

.drop-zone__file {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	max-width: 100%;
}

.file-icon {
	font-size: 28px;
	color: var(--el-color-success);
	flex-shrink: 0;
}

.file-name {
	font-size: 14px;
	color: var(--el-text-color-primary);
	font-weight: 500;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: calc(100% - 80px);
}

.drop-zone__clear {
	flex-shrink: 0;
}

.import-hint {
	padding: 0 4px;
	border-radius: 8px;
	background: var(--el-fill-color-light);
	border: 1px solid var(--el-border-color-lighter);
}

.hint-line {
	margin: 0;
	padding: 14px 16px 10px;
	font-size: 13px;
	line-height: 1.65;
	color: var(--el-text-color-regular);
}

.hint-link {
	font-size: 13px;
	font-weight: 500;
	vertical-align: baseline;
}

.hint-tip {
	margin: 0;
	font-size: 12px;
	line-height: 1.5;
	color: var(--el-text-color-secondary);
}

.import-dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
}
</style>
