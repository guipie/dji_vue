import { defineConfig, transformerDirectives, presetAttributify, presetWind3, presetIcons } from 'unocss';

export default defineConfig({
	// UnoCSS 的配置
	presets: [
		// 默认预设
		presetWind3({
			// important: "#app"
			important: 'body',
		}),
		presetAttributify(), //属性语义化 无须class <div font="black">
		presetIcons({
			customizations: {
				customize(props) {
					props.width = '1.5em';
					props.height = '1.5em';
					return props;
				},
			},
		}),
	],
	rules: [
		['bgp', { 'background-color': 'var(--el-color-primary)' }], // 匹配 flex-center 和 flex-center-* 模式
		[
			/^flex-center(?:-(\d+))?$/,
			([, gap]) => ({
				display: 'flex',
				'justify-content': 'center',
				'align-items': 'center',
				...(gap && { gap: `${gap / 4}rem` }), // 将数字转换为 rem 单位
			}),
		],
		// 匹配 flex-col-center 和 flex-col-center-* 模式
		[
			/^flex-col-center(?:-(\d+))?$/,
			([, gap]) => ({
				display: 'flex',
				'flex-direction': 'column',
				'justify-content': 'center',
				'align-items': 'center',
				...(gap && { gap: `${gap / 4}rem` }), // 将数字转换为 rem 单位
			}),
		],
	],
	shortcuts: {
		// ------------------------------------------------------------------
		// 颜色简写：沿用项目页面里一直在用的 c-* 写法。
		//
		// 这些类名源自 vue-next-admin 的旧 ex-theme，但本项目用的是 UnoCSS，
		// 而 UnoCSS 并不认识 c-gray / c-danger —— 结果是页面上这些地方的颜色
		// 全部静默失效（既不报错、也不生效），排查时极难发现。
		// 这里把缺失的定义补齐，取值一律指向 Element Plus 的主题变量，
		// 因此在明暗主题切换下都能取到正确颜色，不需要再写自定义 CSS。
		// ------------------------------------------------------------------
		'c-gray': 'text-[var(--el-text-color-secondary)]',
		'c-danger': 'text-[var(--el-color-danger)]',
		'c-warning': 'text-[var(--el-color-warning)]',
		'c-success': 'text-[var(--el-color-success)]',
		'c-primary': 'text-[var(--el-color-primary)]',
		'c-info': 'text-[var(--el-color-info)]',
		'c-white': 'text-white',

		// ------------------------------------------------------------------
		// 间距简写：mb10 的心智模型是「10px」，但在 Tailwind 语义下 mb10 = 2.5rem。
		//
		// 项目里 95 处 *10 类都按「10 像素」在用（跟着旧 ex-theme 的习惯），
		// 直接套 Tailwind 语义会得到 40px 的巨大间距。这里显式钉成 10px，
		// 既符合作者意图，也让页面上同类元素的间距保持一致。
		// ------------------------------------------------------------------
		'mt10': 'mt-[10px]',
		'mb10': 'mb-[10px]',
		'ml10': 'ml-[10px]',
		'mr10': 'mr-[10px]',
		'p10': 'p-[10px]',
		'pt10': 'pt-[10px]',
		'pb10': 'pb-[10px]',
		'pl10': 'pl-[10px]',
		'pr10': 'pr-[10px]',

		'btn-green': 'text-white bg-green-500 hover:bg-green-700',
		// 将规则改为快捷方式
		'option-selected': 'color-white bg-[var(--el-color-primary)] border-[var(--el-color-primary)] shadow-sm transition-all duration-300 option-md text-center',
		'option-selected-dark': 'color-white bg-[var(--el-color-primary)] border-[var(--el-color-primary)] shadow-sm transition-all duration-300 option-md text-center',
		'option-unselected':
			'color-[#a0a0a0] bg-[color-mix(in srgb,var(--el-color-primary),white 60%)] border-[color-mix(in srgb,var(--el-color-primary),black 50%)] transition-all duration-300 option-md cursor-pointer',
		'option-hover': 'hover:color-white hover:border-[var(--el-color-primary)]',
		'option-selected-hover': 'option-selected cursor-pointer hover:op70',
		'option-unselected-hover': 'option-unselected option-hover',
		'option-sm': 'px-3 py-1.5 text-xs rounded',
		'option-md': 'px-4 py-2 text-sm rounded-md',
		'option-lg': 'px-5 py-3 text-base rounded-lg',
		'flex-center': 'flex justify-center items-center',
		'flex-col-center': 'flex flex-col justify-center items-center',
	},
	transformers: [transformerDirectives()], //在 --at-apply 中写 UnoCSS 即可。 .class{ --at-apply: p-20 flex justify-around;}
});
