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
