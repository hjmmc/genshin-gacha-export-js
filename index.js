// library from cdn
const ExcelJSUrl = "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.2.0/exceljs.min.js";
const FileSaverUrl = "https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js";
const GachaTypesUrl = `https://hk4e-api.mihoyo.com/event/gacha_info/api/getConfigList`;
const GachaLogBaseUrl = `https://hk4e-api.mihoyo.com/event/gacha_info/api/getGachaLog`;

let AuthKey = ''
let AuthKeyVer = '1'
let Lang = 'zh-cn'

const mask = document.createElement('div')
mask.style = 'position: fixed;top: 0;bottom: 0;left: 0;right: 0;background: #000e;z-index: 99999;color: #fff;padding: 20px;font-size: 12px;overflow-y: auto;'
document.body.append(mask)

function htmlLog(str) {
	console.log(str)
	mask.innerHTML = `${str}<br>` + mask.innerHTML
}

function fetch2() {
	return fetch(...arguments).then((res) => res.json()).then(ret => {
		if (ret.retcode !== 0) {
			htmlLog(ret.message || '请求失败!')
			return Promise.reject(ret)
		}
		return ret
	}, err => {
		htmlLog('网络错误!')
		return Promise.reject(err)
	})

}

function loadScript(src) {
	return new Promise((resolve, reject) => {
		if (document.querySelector(`script[src="${src}"]`)) {
			resolve();
		}
		const s = document.createElement("script");
		s.src = src;
		s.onload = resolve;
		s.onerror = reject;
		document.body.append(s);
	});
}

async function getGachaLog(key, page, end_id) {
	return fetch2(
		GachaLogBaseUrl +
		`?authkey=${AuthKey}` +
		`&authkey_ver=${AuthKeyVer}` +
		`&lang=${Lang}` +
		`&gacha_type=${key}` +
		`&page=${page}` +
		`&size=${20}` +
		`&end_id=${end_id}`
	)
		.then((data) => data);
}

async function getGachaLogs(name, key) {
	let page = 1,
		data = [],
		res = [];
	let end_id = "0";
	let list = [];
	do {
		htmlLog(`正在获取${name}第${page}页`);
		res = await getGachaLog(key, page, end_id);
		// await sleep(0.2);
		end_id = res.data.list.length > 0 ? res.data.list[res.data.list.length - 1].id : 0;
		list = res.data.list;
		data.push(...list);
		page += 1;
	} while (list.length > 0);
	return data;
}

function pad(num) {
	return `${num}`.padStart(2, "0");
}

function getTimeString() {
	const d = new Date();
	const YYYY = d.getFullYear();
	const MM = pad(d.getMonth() + 1);
	const DD = pad(d.getDate());
	const HH = pad(d.getHours());
	const mm = pad(d.getMinutes());
	const ss = pad(d.getSeconds());
	return `${YYYY}${MM}${DD}_${HH}${mm}${ss}`;
}

async function main() {
	htmlLog("start load script");
	await loadScript(ExcelJSUrl);
	htmlLog("load exceljs success");
	await loadScript(FileSaverUrl);
	htmlLog("load filesaver success");
	const uri = new URL(window.location.href)
	AuthKey = uri.searchParams.get('authkey')
	if (!AuthKey) {
		htmlLog('AuthKey 获取失败!')
		alert('AuthKey 获取失败!')
		return
	}
	if (AuthKey.includes('/')) {
		AuthKey = encodeURIComponent(AuthKey)
	}
	AuthKeyVer = uri.searchParams.get('authkey_ver') || '1'
	Lang = uri.searchParams.get('lang') || 'zh-cn'

	const gachaTypes = await fetch2(`${GachaTypesUrl}?authkey=${AuthKey}&authkey_ver=${AuthKeyVer}&lang=${Lang}`)
		.then((data) => data.data.gacha_type_list);
	htmlLog("获取抽卡活动类型成功");

	htmlLog("开始获取抽卡记录");
	const workbook = new ExcelJS.Workbook();
	for (const type of gachaTypes) {
		const sheet = workbook.addWorksheet(type.name, {
			views: [{
				state: "frozen",
				ySplit: 1
			}],
		});
		sheet.columns = [{
			header: "时间",
			key: "time",
			width: 24
		}, {
			header: "名称",
			key: "name",
			width: 14
		}, {
			header: "类别",
			key: "type",
			width: 8
		}, {
			header: "星级",
			key: "rank",
			width: 8
		}, {
			header: "总次数",
			key: "idx",
			width: 8
		}, {
			header: "保底内",
			key: "pdx",
			width: 8
		},];
		// get gacha logs
		const logs = (await getGachaLogs(type.name, type.key)).map((item) => {
			// const match = data.find((v) => v.item_id === item.item_id);
			return [
				item.time,
				item.name,
				item.item_type,
				parseInt(item.rank_type),
			];
		});
		logs.reverse();
		idx = 0;
		pdx = 0;
		for (log of logs) {
			idx += 1;
			pdx += 1;
			log.push(idx, pdx);
			if (log[3] === 5) {
				pdx = 0;
			}
		}
		// htmlLog(logs);
		sheet.addRows(logs);
		// set xlsx hearer style
		["A", "B", "C", "D", "E", "F"].forEach((v) => {
			sheet.getCell(`${v}1`).border = {
				top: {
					style: "thin",
					color: {
						argb: "ffc4c2bf"
					}
				},
				left: {
					style: "thin",
					color: {
						argb: "ffc4c2bf"
					}
				},
				bottom: {
					style: "thin",
					color: {
						argb: "ffc4c2bf"
					}
				},
				right: {
					style: "thin",
					color: {
						argb: "ffc4c2bf"
					}
				},
			};
			sheet.getCell(`${v}1`).fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: {
					argb: "ffdbd7d3"
				},
			};
			sheet.getCell(`${v}1`).font = {
				name: "微软雅黑",
				color: {
					argb: "ff757575"
				},
				bold: true,
			};
		});
		// set xlsx cell style
		logs.forEach((v, i) => {
			["A", "B", "C", "D", "E", "F"].forEach((c) => {
				sheet.getCell(`${c}${i + 2}`).border = {
					top: {
						style: "thin",
						color: {
							argb: "ffc4c2bf"
						}
					},
					left: {
						style: "thin",
						color: {
							argb: "ffc4c2bf"
						}
					},
					bottom: {
						style: "thin",
						color: {
							argb: "ffc4c2bf"
						}
					},
					right: {
						style: "thin",
						color: {
							argb: "ffc4c2bf"
						}
					},
				};
				sheet.getCell(`${c}${i + 2}`).fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: {
						argb: "ffebebeb"
					},
				};
				// rare rank background color
				const rankColor = {
					3: "ff8e8e8e",
					4: "ffa256e1",
					5: "ffbd6932",
				};
				sheet.getCell(`${c}${i + 2}`).font = {
					name: "微软雅黑",
					color: {
						argb: rankColor[v[3]]
					},
					bold: v[3] != "3",
				};
			});
		});
	}
	htmlLog("获取抽卡记录结束");
	htmlLog("正在导出");
	const filename = `原神抽卡记录导出_${getTimeString()}.xlsx`
	try {
		const buffer = await workbook.xlsx.writeBuffer();
		saveAs(
			new Blob([buffer], { type: "application/octet-stream" }),
			filename
		);
		htmlLog("导出成功: " + filename);
	} catch (e) {
		htmlLog(`导出失败: ${e}`);
	}
	htmlLog('<a target="_blank" style="font-size:20px;color:red;" href="https://genshin.lhjmmc.cn">打开分析界面</a>');
}

if (!window.location.host.endsWith('mihoyo.com')) {
	htmlLog('请在米哈游通行证页面执行!')
} else {
	main()
}