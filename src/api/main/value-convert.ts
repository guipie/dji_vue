import { ElTag } from "element-plus"
import { h } from "vue"

export const convertContentStatus = (val: any) => {
  const { status } = val;
  switch (status) {
    case 0:
      return h(ElTag, { type: 'info', effect: "dark" }, { default: () => '待审核' });
    case 1:
      return h(ElTag, { type: 'success', effect: "dark" }, { default: () => '已审核' });
    case 2:
      return h(ElTag, { type: 'warning', effect: "dark" }, { default: () => '已推荐' });
    case 3:
      return h(ElTag, { type: 'danger', effect: "dark" }, { default: () => '已置顶' });
    default:
      return h(ElTag, { effect: 'light' }, { default: () => '无效状态' });
  }
}