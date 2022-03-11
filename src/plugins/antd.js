// 按需加载 ant-design-vue
// 手动删除没用用过的组件
import Vue from 'vue';
import 'ant-design-vue/lib/form/style/css';
import 'ant-design-vue/lib/button/style/css';
import 'ant-design-vue/lib/slider/style/css';
import 'ant-design-vue/lib/checkbox/style/css';
import 'ant-design-vue/lib/switch/style/css';
import 'ant-design-vue/lib/dropdown/style/css';
import 'ant-design-vue/lib/menu/style/css';
import 'ant-design-vue/lib/icon/style/css';
import 'ant-design-vue/lib/avatar/style/css';
import 'ant-design-vue/lib/date-picker/style/css';
import 'ant-design-vue/lib/radio/style/css';
import 'ant-design-vue/lib/tag/style/css';
import 'ant-design-vue/lib/input/style/css';
import 'ant-design-vue/lib/tooltip/style/css';
import 'ant-design-vue/lib/select/style/css';
import 'ant-design-vue/lib/input-number/style/css';
import 'ant-design-vue/lib/popover/style/css';
import 'ant-design-vue/lib/alert/style/css';
import 'ant-design-vue/lib/upload/style/css';
import 'ant-design-vue/lib/modal/style/css';
import 'ant-design-vue/lib/tree-select/style/css';
import 'ant-design-vue/lib/tree/style/css';
import 'ant-design-vue/lib/cascader/style/css';
import 'ant-design-vue/lib/spin/style/css';
import 'ant-design-vue/lib/time-picker/style/css';
import {
  Form,
  Button,
  Dropdown,
  Slider,
  Icon,
  Menu,
  Avatar,
  DatePicker,
  Radio,
  Tag,
  Input,
  Tooltip,
  Select,
  InputNumber,
  Popover,
  Alert,
  Upload,
  Modal,
  TreeSelect,
  Checkbox,
  Switch,
  Cascader,
  ConfigProvider,
  Tree,
  Spin,
  TimePicker
} from 'ant-design-vue';

/* v1.1.3+ registration methods */
Vue.use(Form);
Vue.use(Button);
Vue.use(Slider);
Vue.use(Dropdown);
Vue.use(Menu);
Vue.use(Icon);
Vue.use(Avatar);
Vue.use(DatePicker);
Vue.use(Radio);
Vue.use(Tag);
Vue.use(Input);
Vue.use(Tooltip);
Vue.use(Select);
Vue.use(InputNumber);
Vue.use(Popover);
Vue.use(Alert);
Vue.use(Upload);
Vue.use(Modal);
Vue.use(TreeSelect);
Vue.use(Tree);
Vue.use(Checkbox);
Vue.use(Switch);
Vue.use(ConfigProvider);
Vue.use(Cascader);
Vue.use(Spin);
Vue.use(TimePicker);
Vue.prototype.$confirm = Modal.confirm;
Vue.prototype.TreeSelect = TreeSelect;