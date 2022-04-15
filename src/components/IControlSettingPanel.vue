<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div
    idm-ctrl="idm_module"
    :id="moduleObject.id"
    :idm-ctrl-id="moduleObject.id"
    class="idm_control_setting_panel"
  >
    <!--
      组件内部容器
      增加class="drag_container" 必选
      idm-ctrl-id：组件的id，这个必须不能为空
      idm-container-index  组件的内部容器索引，不重复唯一且不变，必选
    -->
    <a-config-provider :locale="locale">
      <a-spin :spinning="spinning" :tip="propData.spinTip||'努力加载中...'">
        <a-form :form="form" :layout="propData.ctrlformLayout" class="idm-control-center-form">
          <a-form-item
            v-for="(item, index) in formControlDataList"
            :key="index"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
            :class="'idm-control-center-'+item.useCtrlId"
          >
            <span slot="label">
              {{ item.attrCname }}
              <a-tooltip
                v-if="item.useCtrlAttr.desc"
                :title="item.useCtrlAttr.desc"
              >
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </span>
            <!--文本框：input-->
            <a-input
              v-if="item.useCtrlId == 'input'"
              v-decorator="[
                item.attrCode,
                { rules: item.useCtrlAttr.rules || [] },
              ]"
              :placeholder="item.useCtrlAttr.placeholder"
              :maxLength="item.useCtrlAttr.maxLength||9999999999999999999"
              :allowClear="item.useCtrlAttr.allowClear===false?false:true"
            />
            <!--数字框：inputNumber-->
            <a-input-number
              v-else-if="item.useCtrlId == 'inputNumber'"
              v-decorator="[
                item.attrCode,
                {
                  /*initialValue: 3,*/
                  rules: item.useCtrlAttr.rules || [],
                },
              ]"
              :min="item.useCtrlAttr.min||-9999999999999999999"
              :max="item.useCtrlAttr.max||9999999999999999999"
              :placeholder="item.useCtrlAttr.placeholder"
            />
            <!--滑动输入条：slider-->
            <a-slider
              v-else-if="item.useCtrlId == 'slider'"
              v-decorator="[
                item.attrCode,
                {
                  rules: item.useCtrlAttr.rules || [],
                },
              ]"
              :min="item.useCtrlAttr.min||0"
              :max="item.useCtrlAttr.max||100"
              :step="item.useCtrlAttr.step||1"
              :marks="item.useCtrlAttr.marks||{}"
              :vertical="item.useCtrlAttr.vertical===true?true:false"
            />
            <!--下拉框：select-->
            <a-select
              v-else-if="item.useCtrlId == 'select'"
              v-decorator="[
                item.attrCode,
                {
                  rules: item.useCtrlAttr.rules || [],
                },
              ]"
              labelInValue
              :mode="item.useCtrlAttr.mode||'default'"
              :placeholder="item.useCtrlAttr.placeholder"
              :allowClear="item.useCtrlAttr.allowClear===false?false:true"
              :options="item.useCtrlAttr.options||[]"
            >
            </a-select>
            <!--颜色选择器：colorPicker-->
            <a-popover
              v-model="item.visible"
              v-else-if="item.useCtrlId == 'colorPicker'"
              :overlayClassName="'idm_control_center_popover'"
              trigger="click"
              placement="bottomLeft"
            >
              <div slot="content">
                <sketch-picker
                  :value="item.colors"
                  @input="colorPickerChange($event, item)"
                ></sketch-picker>
              </div>
              <a-input
                autocomplete="off"
                v-decorator="[
                  item.attrCode,
                  {
                    rules: item.useCtrlAttr.rules || [],
                  },
                ]"
                :placeholder="item.useCtrlAttr.placeholder"
                @change="colorInputChange($event, item)"
                :allowClear="item.useCtrlAttr.allowClear===false?false:true"
              >
                <div
                  class="idm_control_center_colorpicker_icon"
                  :style="{
                    'background-color':
                      item.colors && item.colors.hex8
                        ? item.colors.hex8
                        : item.colors,
                  }"
                  slot="prefix"
                ></div>
              </a-input>
            </a-popover>
            <!--文件上传框：upload-->
            <a-upload
              v-else-if="item.useCtrlId == 'upload'"
              v-decorator="[
                item.attrCode,
                {
                  valuePropName: 'fileList',
                  rules: item.useCtrlAttr.rules || [],
                },
              ]"
              :name="item.useCtrlAttr.inputFileName||'file'"
              :list-type="item.useCtrlAttr.listType||'text'"
              :accept="item.useCtrlAttr.uploadSuffix||'image/*'"
              :multiple="item.useCtrlAttr.multipleMode===true"
              :customRequest="(file)=>uploadFileHandle(file,item)"
              @change="(file)=>uploadFileChange(file,item)"
            >
              <a-button> <a-icon type="upload" /> {{item.useCtrlAttr.buttonName}} </a-button>
            </a-upload>
            <!--按钮组：radioButton-->
            <a-radio-group
              v-else-if="item.useCtrlId == 'radioButton'"
              v-decorator="[
                item.attrCode,
                {
                  rules: item.useCtrlAttr.rules || [],
                },
              ]"
              :buttonStyle="item.useCtrlAttr.buttonStyle||'outline'"
              :name="item.useCtrlAttr.groupName||item.attrRef"
            >
              <a-radio-button v-for="(oitem,oindex) in (item.useCtrlAttr.options||[])" :disabled="oitem.disabled" :key="oindex" :value="oitem.value">
                {{oitem.title}}
              </a-radio-button>
            </a-radio-group>
            <!--单选框：radio-->
            <a-radio-group
              v-else-if="item.useCtrlId == 'radio'"
              v-decorator="[
                item.attrCode,
                {
                  rules: item.useCtrlAttr.rules || [],
                },
              ]"
              :name="item.useCtrlAttr.groupName||item.attrRef"
            >
              <a-radio v-for="(oitem,oindex) in (item.useCtrlAttr.options||[])" :disabled="oitem.disabled" :key="oindex" :value="oitem.value">
                {{oitem.title}}
              </a-radio>
            </a-radio-group>
            <!--复选框：checkbox-->
            <a-checkbox-group
              v-else-if="item.useCtrlId == 'checkbox'"
              v-decorator="[
                item.attrCode,
                {
                  rules: item.useCtrlAttr.rules || [],
                },
              ]"
              :options="item.useCtrlAttr.options||[]"
            />
            <!--开关：switch-->
            <a-switch
              v-else-if="item.useCtrlId == 'switch'"
              v-decorator="[
                item.attrCode,
                {
                  valuePropName: 'checked',
                  rules: item.useCtrlAttr.rules || [],
                },
              ]"
            />
            <!--多行文本框：textarea-->
            <a-textarea
              v-else-if="item.useCtrlId == 'textarea'"
              v-decorator="[
                item.attrCode,
                {
                  rules: item.useCtrlAttr.rules || [],
                },
              ]"
              :placeholder="item.useCtrlAttr.placeholder"
              :allowClear="item.useCtrlAttr.allowClear===false?false:true"
              :auto-size="item.useCtrlAttr.autosize===false?false:(item.useCtrlAttr.autosize||true)"
            />
            <!--日期：datePicker-->
            <a-date-picker
              v-else-if="item.useCtrlId == 'datePicker'"
              v-decorator="[
                item.attrCode,
                {
                  rules: item.useCtrlAttr.rules || [],
                },
              ]"
              :placeholder="item.useCtrlAttr.placeholder"
              :allowClear="item.useCtrlAttr.allowClear===false?false:true"
              :mode="item.useCtrlAttr.mode||'date'"
              :show-time="item.useCtrlAttr.showTime"
              :format="item.useCtrlAttr.format||'YYYY-MM-DD HH:mm:ss'"
            />
            <!--树结构下拉框：treeSelect-->
            <a-tree-select
              v-else-if="item.useCtrlId == 'treeSelect'"
              v-decorator="[
                item.attrCode,
                {
                  rules: item.useCtrlAttr.rules || [],
                  getValueFromEvent: normFile,
                },
              ]"
              labelInValue
              :tree-data="item.useCtrlAttr.options||[]"
              :replaceFields="item.useCtrlAttr.replaceFields||{children:'children', title:'title', key:'key', value: 'value' }"
              :treeDataSimpleMode="item.useCtrlAttr.treeDataSimpleMode===true?true:false"
              tree-checkable
              :show-checked-strategy="TreeSelect[item.useCtrlAttr.showCheckedStrategy||'SHOW_CHILD']"
              :placeholder="item.useCtrlAttr.placeholder"
            />
            <!--面板选择：panelSelect-->
            <div v-else-if="item.useCtrlId == 'panelSelect'">
              <a-select
                v-show="false"
                v-decorator="[
                  item.attrCode,
                  { rules: item.useCtrlAttr.rules || [] },
                ]"
                labelInValue
                mode="multiple"
              />
              <draggable
                class="control-center-panel-select-group"
                tag="ul"
                v-model="item.selectedList"
                v-bind="dragOptions"
                @start="panelSelectDrag = true"
                @end="panelSelectDrag = false;changePanelSelectOrder(item)"
              >
                <transition-group
                  type="transition"
                  :name="!panelSelectDrag ? 'flip-list' : null"
                >
                  <li
                    class="control-center-panel-select-group-item"
                    v-for="element in item.selectedList"
                    :key="element.value"
                  >
                    {{ element.title
                    }}<a-icon
                      type="close"
                      @click="panelSelectCheck(item,element,'yxz')"
                      class="control-center-panel-select-group-close"
                    />
                  </li>
                </transition-group>
                <div slot="footer" key="footer" style="display: inline-block;">
                  <a-popover
                    v-model="item.visible"
                    placement="bottomLeft"
                    :overlayClassName="'control-center-panel-select-popover'"
                    trigger="click"
                  >
                    <div slot="content">
                      <li
                        class="control-center-panel-select-group-item"
                        v-for="element in item.useCtrlAttr.options"
                        :key="element.value"
                        @click="panelSelectCheck(item,element,'mb')"
                        :class="{ 'select-active': getPanelSelectCheck(item,element)>-1 }"
                      >
                        <a-icon
                          type="check" v-if="getPanelSelectCheck(item,element)>-1"
                          class="control-center-panel-select-group-check"
                        />{{ element.title }}
                      </li>
                      <div class="control-center-panel-select-footer">
                        <div>
                          <a href="javascript:;" v-if="item.selectedList.length!=item.useCtrlAttr.options.length" @click="panelSelectCheck(item,null,'all')">全选</a>
                          <a href="javascript:;" v-else @click="panelSelectCheck(item,null,'unall')">取消全选</a>
                        </div>
                        <div class="control-center-panel-select-desc">
                          注：半透明灰色代表已选择，点击可取消选择
                        </div>
                      </div>
                    </div>
                    <a-button icon="plus" class="control-center-panel-select-add"
                      >选择
                    </a-button>
                  </a-popover>
                </div>
              </draggable>
            </div>
            <!--用户/部门选择：userSelect-->
            <a-select
              mode="multiple"
              :showSearch="true"
              labelInValue
              :open="item.dropdownOpen"
              optionFilterProp="children"
              dropdownClassName="idm-control-center-userselect-dropdown"
              @search="
                (value) => {
                  item.isSearching = value;
                  if(!item.dropdownOpen){
                    item.dropdownOpen = true;
                  }
                }
              "
              @deselect="dropDownDeSelect($event,item);"
              @select="dropDownSelect($event,item)"
              @focus="openDropDownBox(item)"
              @blur="item.isSearching = false"
              v-else-if="
                item.useCtrlId == 'userSelect' || item.useCtrlId == 'codeSelect'
              " 
              v-decorator="[
                item.attrCode,
                {
                  rules: item.useCtrlAttr.rules || [],
                },
              ]"
            >
              <div slot="dropdownRender" slot-scope="menu">
                <v-nodes :vnodes="menu" v-if="item.isSearching" />
                <div
                  :ref="item.attrRef"
                  class="control-setting-userselect-panel"
                  v-else
                >
                  <div>
                    <a-tree
                      checkable
                      v-model="item.selectedListKey"
                      :replaceFields="item.useCtrlAttr.replaceFields||{children:'children', title:'title', key:'key', value: 'value' }"
                      :auto-expand-parent="true"
                      :selectedKeys="item.selectedListKey"
                      :tree-data="item.useCtrlAttr.options||[]"
                      @select="onUserDeptSelect($event)"
                      @check="(checkedKeys,e)=>onUserDeptCheck(checkedKeys,e,item)"
                    >
                    </a-tree>
                  </div>
                  <div>
                    <div class="right-selected-box">
                      <draggable
                        class="control-center-userdept-select-group"
                        tag="ul"
                        v-model="item.selectedList"
                        v-bind="dragOptionsUser"
                        @start="userDeptSelectDrag = true"
                        @end="userDeptSelectDrag = false;changePanelSelectOrder(item)"
                      >
                        <transition-group
                          type="transition"
                          :name="!userDeptSelectDrag ? 'flip-list' : null"
                        >
                          <li
                            class="control-center-userdept-select-group-item"
                            v-for="(element, eindex) in item.selectedList"
                            :title="element[item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.title?item.useCtrlAttr.replaceFields.title:'title']"
                            :key="element[item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.value?item.useCtrlAttr.replaceFields.value:'value']"
                          >
                            {{ element[item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.title?item.useCtrlAttr.replaceFields.title:'title']
                            }}<a-icon
                              type="close"
                              @click="panelItemClose(item, element, eindex)"
                              class="control-center-userdept-select-group-close"
                            />
                          </li>
                        </transition-group>
                      </draggable>
                    </div>
                    <span class="footer-check-number">
                      <span>已选 {{item.selectedList.length}} 项</span>
                      <div>
                        <a href="javascript:;" @click="clearUserDeptCheck(item)">清空</a>&nbsp;&nbsp;
                        <a
                          href="javascript:;"
                          @click="
                            item.dropdownOpen = false;
                            item.dropdownOpening = false;
                          "
                          >关闭</a
                        >
                      </div>
                    </span>
                  </div>
                </div>
              </div>
              <a-select-option
                v-for="(sitem,ssindex) in item.selectOptionList"
                :key="ssindex"
                :value="sitem[item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.value?item.useCtrlAttr.replaceFields.value:'value']"
              >
                {{ sitem[item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.title?item.useCtrlAttr.replaceFields.title:'title'] }}
              </a-select-option>
            </a-select>
            <!--代码选择：codeSelect-->
            <!--时间选择：timePicker-->
            <a-time-picker
              v-else-if="item.useCtrlId == 'timePicker'"
              v-decorator="[
                item.attrCode,
                {
                  rules: item.useCtrlAttr.rules || [],
                },
              ]"
              :placeholder="item.useCtrlAttr.placeholder"
              :allowClear="item.useCtrlAttr.allowClear===false?false:true"
              :format="item.useCtrlAttr.format||'HH:mm:ss'"
            />
            <!--级联选择：cascader-->
            <a-cascader
              v-else-if="item.useCtrlId == 'cascader'"
              v-decorator="[
                item.attrCode,
                {
                  rules: item.useCtrlAttr.rules || [],
                },
              ]"
              :fieldNames="item.useCtrlAttr.replaceFields||{children:'children', label:'label', value: 'value' }"
              :options="item.useCtrlAttr.options"
              :placeholder="item.useCtrlAttr.placeholder"
              :allowClear="item.useCtrlAttr.allowClear===false?false:true"
            />
          </a-form-item>
          <a-form-item  v-if="propData.ctrlButtonPosition=='formlast'" :wrapper-col="buttonItemLayout.wrapperCol">
            <div class="cc-btn-box-common" :class="'cc-btn-'+propData.ctrlButtonAlign">
              <template v-for="(bitem,bindex) in propData.buttonList" >
                <a-button v-if="bitem.buttonName"
                :key="bindex" 
                :type="bitem.buttonType" 
                :shape="bitem.buttonShape" 
                :size="bitem.buttonSize" 
                :ghost="bitem.buttonGhost" 
                :style="bitem.buttonCSS" 
                :loading="bitem.buttonLoading?bitem.loading:false" 
                @click="clickButtonHandle(bitem)"
                >{{bitem.buttonName}}</a-button>
              </template>
            </div>
          </a-form-item>
        </a-form>
      </a-spin>
    </a-config-provider>
    <div class="idm-control-center-bottom-fixed cc-btn-box-common" :class="'cc-btn-'+propData.ctrlButtonAlign+' cc-btn-position-'+propData.ctrlButtonPosition+' env_'+moduleObject.env" v-if="propData.ctrlButtonPosition!='formlast'">
      <template v-for="(bitem,bindex) in propData.buttonList" >
        <a-button v-if="bitem.buttonName"
          :key="bindex" 
          :type="bitem.buttonType" 
          :shape="bitem.buttonShape" 
          :size="bitem.buttonSize" 
          :ghost="bitem.buttonGhost" 
          :style="bitem.buttonCSS" 
          :loading="bitem.buttonLoading?bitem.loading:false" 
          @click="clickButtonHandle(bitem)"
        >{{bitem.buttonName}}</a-button>
      </template>
    </div>
  </div>
</template>

<script>

import { Sketch } from "vue-color";
import draggable from "vuedraggable";
import locale from "ant-design-vue/lib/locale-provider/zh_CN";
export default {
  name: "IControlSettingPanel",
  components: {
    "sketch-picker": Sketch,
    draggable,
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes,
    },
  },
  data() {
    return {
      locale,
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {
        ctrlDataIntelface:"/ctrl/idm/console/fetchMarketModuleAttrData",
        codeDataIntelface:"/ctrl/code/select/data",
        sqlDataIntelface:"/ctrl/code/select/metaSql",
        fileUploadDataIntelface:"/ctrl/idm/api/fileupload",
        ctrlformLayout:"horizontal",
        ctrlButtonPosition:"bottom",
        ctrlButtonAlign:"right"
      },
      form: this.$form.createForm(this, { name: "dynamic_rule" }),
      formControlDataList: [
        // {
        //   attrCname: "文本框",
        //   attrCode: "input",
        //   useCtrlId: "input",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        // },
        // {
        //   attrCname: "数字框",
        //   attrCode: "inputNumber",
        //   useCtrlId: "inputNumber",
        //   valueTypeId: "number",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        // },
        // {
        //   attrCname: "滑动输入条",
        //   attrCode: "slider",
        //   useCtrlId: "slider",
        //   valueTypeId: "number",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        // },
        // {
        //   attrCname: "下拉框",
        //   attrCode: "select",
        //   useCtrlId: "select",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        // },
        // {
        //   attrCname: "颜色选择器",
        //   attrCode: "colorPicker",
        //   useCtrlId: "colorPicker",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        //   colors: "",
        // },
        // {
        //   attrCname: "文件上传框",
        //   attrCode: "upload",
        //   useCtrlId: "upload",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        // },
        // {
        //   attrCname: "按钮组",
        //   attrCode: "radioButton",
        //   useCtrlId: "radioButton",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        // },
        // {
        //   attrCname: "单选框",
        //   attrCode: "radio",
        //   useCtrlId: "radio",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        // },
        // {
        //   attrCname: "复选框",
        //   attrCode: "checkbox",
        //   useCtrlId: "checkbox",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        // },
        // {
        //   attrCname: "开关",
        //   attrCode: "switch",
        //   useCtrlId: "switch",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        // },
        // {
        //   attrCname: "多行文本框",
        //   attrCode: "textarea",
        //   useCtrlId: "textarea",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        // },
        // {
        //   attrCname: "日期",
        //   attrCode: "datePicker",
        //   useCtrlId: "datePicker",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        // },
        // {
        //   attrCname: "树结构下拉框",
        //   attrCode: "treeSelect",
        //   useCtrlId: "treeSelect",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        // },
        // {
        //   attrCname: "用户/部门选择",
        //   attrCode: "userSelect",
        //   useCtrlId: "userSelect",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        //   attrRef: "ref_" + "1123232",
        //   isSearching: false,
        //   dropdownOpen: false,
        //   selectedList: [
        //     { name: "我的待办", order: 1 },
        //     { name: "我的待阅", order: 2 },
        //     { name: "关注事项", order: 3 },
        //     { name: "督办列表", order: 4 },
        //     { name: "通知公告", order: 5 },
        //     { name: "我的便笺", order: 6 },
        //   ],
        // },
        // {
        //   attrCname: "面板选择",
        //   attrCode: "panelSelect",
        //   useCtrlId: "panelSelect",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        //   selectedList: [
        //     { name: "我的待办", order: 1 },
        //     { name: "我的待阅", order: 2 },
        //     { name: "关注事项", order: 3 },
        //     { name: "督办列表", order: 4 },
        //     { name: "通知公告", order: 5 },
        //     { name: "我的便笺", order: 6 },
        //   ],
        // },
        // {
        //   attrCname: "代码选择",
        //   attrCode: "codeSelect",
        //   useCtrlId: "codeSelect",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        //   attrRef: "ref_" + "23223",
        //   isSearching: false,
        //   dropdownOpen: false,
        //   selectedList: [
        //     { name: "我的待办", order: 1 },
        //     { name: "我的待阅", order: 2 },
        //     { name: "关注事项", order: 3 },
        //     { name: "督办列表", order: 4 },
        //     { name: "通知公告", order: 5 },
        //     { name: "我的便笺", order: 6 },
        //   ],
        // },
        // {
        //   attrCname: "时间选择",
        //   attrCode: "timePicker",
        //   useCtrlId: "timePicker",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        // },
        // {
        //   attrCname: "级联选择",
        //   attrCode: "cascader",
        //   useCtrlId: "cascader",
        //   valueTypeId: "string",
        //   useCtrlAttr: {},
        //   defaultValue: "",
        //   valueMethod: "",
        // },
      ],
      panelSelectDrag: false,
      userDeptSelectDrag: false,
      selectedKeys: [],
      spinning:true,
    };
  },
  props: {},
  created() {
    this.moduleObject = this.$root.moduleObject;
    // console.log(this.moduleObject)
    this.initAttrToModule();
  },
  mounted() {},
  destroyed() {},
  computed: {
    formItemLayout() {
      const { propData } = this;
      return propData.ctrlformLayout === "horizontal"
        ? {
            labelCol: { span: 6 },
            wrapperCol: { span: 16 },
          }
        : {};
    },
    buttonItemLayout() {
      const { propData } = this;
      return propData.ctrlformLayout === "horizontal"
        ? {
            wrapperCol: { span: 16, offset: 6 },
          }
        : {};
    },
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "control-center-panel-select-ghost",
      };
    },
    dragOptionsUser() {
      return {
        animation: 200,
        group: "userdeptgroup",
        disabled: false,
        ghostClass: "control-center-panel-select-ghost",
      };
    },
  },
  methods: {
    /**
     * 按钮点击事件
     */
    clickButtonHandle(buttonItem){
      let that = this;
      if(this.moduleObject.env=="develop"){
        //开发模式下不执行此事件
        return;
      }
      if(buttonItem.buttonLoading){
        buttonItem.loading = true;
        that.$forceUpdate();
      }
      if(buttonItem.buttonAction=="commit"){
        this.commitFormData(buttonItem);
      }else if(buttonItem.buttonAction=="reset"){
        this.resetFormData(buttonItem);
      }
      //获取所有的URL参数、页面ID（pageId）、以及所有组件的返回值（用范围值去调用IDM提供的方法取出所有的组件值）
      let urlObject = window.IDM.url.queryObject(),
      pageId = window.IDM.broadcast&&window.IDM.broadcast.pageModule?window.IDM.broadcast.pageModule.id:"";
      //自定义函数
      var clickFunction = buttonItem.buttonClickFunction;
      clickFunction&&clickFunction.forEach(item=>{
        window[item.name]&&window[item.name].call(this,{
          urlData:urlObject,
          pageId,
          customParam:item.param,
          _this:this,
          formData:this.form.getFieldsValue(),
          loadDone:()=>{
            buttonItem.loading=false;
            that.$forceUpdate();
          }
        });
      })
    },
    /**
     * 提交表单数据
     */
    commitFormData(buttonItem) {
      let that = this;
      this.form.validateFields((err,fieldsValue) => {
        if (!err) {
          console.info("success",fieldsValue);

          //自定义接口
          var commitIntelfaceUrl = that.propData.commitIntelfaceUrl;
          commitIntelfaceUrl&&window.IDM.http.post(commitIntelfaceUrl, {
            ...that.commonParam(),
            formData:JSON.stringify(fieldsValue)
          },{
            headers:that.propData.commitContentType?{
                "Content-Type": that.propData.commitContentType||"application/json;charset=UTF-8"
              }:{}
          }).then((res) => {
            //调用后续自定义函数
            that.commitRunLaterHandle(res,buttonItem);
          })
          .catch(function (error) {
            buttonItem.loading = false;
            that.$forceUpdate();
          })
        }else{
          buttonItem.loading = false;
          that.$forceUpdate();
        }
      });
    },
    /**
     * 确定后执行的函数
     */
    commitRunLaterHandle(res,buttonItem){
      let urlObject = window.IDM.url.queryObject(),
      pageId = window.IDM.broadcast&&window.IDM.broadcast.pageModule?window.IDM.broadcast.pageModule.id:"";
      if(this.propData.commitRunLaterFunction&&this.propData.commitRunLaterFunction.length>0){
        var commitRunLaterFunction = this.propData.commitRunLaterFunction;
        commitRunLaterFunction.forEach(item=>{
          window[item.name]&&window[item.name].call(this,{
            urlData:urlObject,
            pageId,
            customParam:item.param,
            _this:this,
            resData:res
          });
        })
      }
      buttonItem.loading = false;
      this.$forceUpdate();
    },
    /**
     * 重置表单数据,恢复初始设置状态
     */
    resetFormData(buttonItem){
      let that = this;
      //自定义接口
      var resetIntelfaceUrl = that.propData.resetIntelfaceUrl;
      resetIntelfaceUrl&&window.IDM.http.post(resetIntelfaceUrl, {
        ...that.commonParam()
      },{
        headers:that.propData.resetContentType?{
            "Content-Type": that.propData.resetContentType||"application/json;charset=UTF-8"
          }:{}
      }).then((res) => {
        //调用后续自定义函数
        that.resetRunLaterHandle(res,buttonItem);
      })
      .catch(function (error) {
        buttonItem.loading = false;
      })
    },
    /**
     * 重置后执行的函数
     */
    resetRunLaterHandle(res,buttonItem){
      let urlObject = window.IDM.url.queryObject(),
      pageId = window.IDM.broadcast&&window.IDM.broadcast.pageModule?window.IDM.broadcast.pageModule.id:"";
      if(this.propData.resetRunLaterFunction&&this.propData.resetRunLaterFunction.length>0){
        var resetRunLaterFunction = this.propData.resetRunLaterFunction;
        resetRunLaterFunction.forEach(item=>{
          window[item.name]&&window[item.name].call(this,{
            urlData:urlObject,
            pageId,
            customParam:item.param,
            _this:this,
            resData:res
          });
        })
      }
      buttonItem.loading = false;
    },
    /**
     * 文件状态改变
     */
    uploadFileChange({ file,fileList },item) {
      // this.fileList = fileList;
      if(file&&file.status=="removed"){
        item.selectedList.forEach((fitem,index)=>{
          const isExists = fileList.filter(item=>item.uid==fitem.uid);
          if(!isExists||(isExists&&isExists.length==0)){
            item.selectedList.splice(index, 1)
          }
        })
        this.changePanelSelectOrderSetFormValue(item);
      }

    },
    /**
     * 上传附件处理函数
     */
    uploadFileHandle(file,item){
      console.log("🚀 ~ file: IControlSettingPanel.vue ~ line 736 ~ uploadFileHandle ~ file", file)
      const action = item.useCtrlAttr.uploadAction||this.propData.fileUploadDataIntelface;
      let that = this;
      let newObject = {
        uid: new Date().getTime()+IDM.uuid(),
        name: file.file.name,
        status: 'uploading',
        // url: IDM.url.getWebPath(resultData.filePath),
      }
      item.selectedList.push(newObject);
      let customParam = {};
      if(item.useCtrlAttr.customParam){
        customParam = item.useCtrlAttr.customParam;
      }
      IDM.http.upload(action,file.file,customParam).then(res=>{
        const showFiledName = item.useCtrlAttr.showFiledName||"data";
        let resultData=res.data.data;
        try {
          resultData = this.replaceExpData(showFiledName,"resultData",res.data);
        } catch (error) {
          
        }
        /**
         * 返回结果：
         * {
         * fileName: "tab设置.png"
         * filePath: "/upload/idmfiles\f22081da-9410-40bc-afa0-6b3106c45c1c.png"
         * fileSize: "218KB"
         * }
         */
        // console.log("上传数据结果",resultData);
        newObject.status = "done";
        newObject.url = IDM.url.getWebPath(resultData.filePath);
        newObject.ourl = resultData.filePath;
        //方便其他地方使用
        newObject.src = newObject.ourl;
        newObject.size = resultData.fileSize;
        newObject.width = resultData.imageWidth;
        newObject.height = resultData.imageHeight;
        // this.visible = !this.visible;
        // this.spinning = !this.spinning;
        that.changePanelSelectOrderSetFormValue(item);

        // this.$message.success(`${file.file.name} 上传成功.`);
      }).catch(err=>{
        // this.$message.error(`${file.file.name} 上传失败.`);
        newObject.status = "error";
      });
    },
    /**
     * 取消选中项方法
     */
    dropDownDeSelect(e,item){
      console.log("🚀 ~ file: IControlSettingPanel.vue ~ line 732 ~ dropDownDeSelect ~ e,item", e,item)
      //e:{key: 'department_200807120024usH4cGf1OJxwicIW6Pk', label: ' 江西省商务委 '}
      //取消选中后需要对selectedKeys进行移除
      if(e&&e.key){
        this.removeSelectData(e.key,item)
        //item.useCtrlAttr.options
        //取消选中要把所有的父节点全部取消、并且要把子节点全部取消
        this.unSelectChildrenTreeNode(item.useCtrlAttr.options,e.key,item)
        this.unSelectParentTreeNode(item,item.useCtrlAttr.options,item.useCtrlAttr.options,e.key);
        this.changePanelSelectOrder(item);
      }
    },
    /**
     * 移除选中的数据通用方法
     */
    removeSelectData(key,item){
      let keyValueName = item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.value?item.useCtrlAttr.replaceFields.value:"value";
      let existsIndex = -1;
      item.selectedListKey&&item.selectedListKey.forEach((skey,sindex)=>{
        if(skey==key){
          existsIndex = sindex;
        }
      })
      existsIndex>-1&&item.selectedListKey.splice(existsIndex,1);
      existsIndex = -1;
      item.selectedList&&item.selectedList.forEach((sitem,sindex)=>{
        if(key==sitem[keyValueName]){
          existsIndex = sindex;
        }
      })
      existsIndex>-1&&item.selectedList.splice(existsIndex,1);
    },
    /**
     * 取消指定key的所有子节点
     */
    unSelectChildrenTreeNode(optionList,key,item){
      const keyValueName = item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.value?item.useCtrlAttr.replaceFields.value:"value";
      const keyChildrenName = item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.children?item.useCtrlAttr.replaceFields.children:"children";
      optionList&&optionList.forEach(sitem=>{
        const keyValue = sitem[keyValueName];
        if(!key){
          //是子节点，全部取消掉
          this.removeSelectData(keyValue,item)
        }
        const childrenData = sitem[keyChildrenName];
        if(childrenData&&childrenData.length>0){
          //这里如果相等则去查找子级并且执行上面那个if取消掉
          this.unSelectChildrenTreeNode(childrenData,!key?'':(keyValue==key?"":key),item);
        }
      })
    },
    /**
     * optionList 数据数组,childKey 子级Key，当前父级parentData
     */
    unSelectParentTreeNode(item,allOptionList,optionList,childKey,parentData){
      const keyValueName = item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.value?item.useCtrlAttr.replaceFields.value:"value";
      const keyChildrenName = item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.children?item.useCtrlAttr.replaceFields.children:"children";
      optionList&&optionList.forEach(sitem=>{
        //当父级还是为空的时候，说明还是在查找子级
        if(childKey==sitem[keyValueName]){
          if(parentData){
            //父级存在,这里做移除操作
            const keyValue = sitem[keyValueName];
            this.removeSelectData(keyValue,item)
            //再次去用子级的方式查父级
            this.unSelectParentTreeNode(item,allOptionList,allOptionList,parentData[keyValueName]);
          }
        }else{
          //接着查找子级
          const childrenData = sitem[keyChildrenName];
          if(childrenData&&childrenData.length>0){
            this.unSelectParentTreeNode(item,allOptionList,childrenData,childKey,sitem);
          }
        }
      });
    },
    /**
     * 选中所有的子级
     */
    selectAllChildrenTreeNode(optionList,key,item){
      const keyValueName = item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.value?item.useCtrlAttr.replaceFields.value:"value";
      const keyChildrenName = item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.children?item.useCtrlAttr.replaceFields.children:"children";
      optionList&&optionList.forEach(sitem=>{
        const keyValue = sitem[keyValueName];
        if(!key){
          const itemSelectedListKey = ","+item.selectedListKey.join(",")+",";
          //是子节点，全部选中
          if(itemSelectedListKey.indexOf(","+keyValue+",")==-1){
            let ssitem = _.cloneDeep(sitem);
            delete ssitem[keyChildrenName];
            item.selectedListKey.push(keyValue);
            item.selectedList.push(ssitem);
          }
        }
        const childrenData = sitem[keyChildrenName];
        if(childrenData&&childrenData.length>0){
          //这里如果相等则去查找子级并且执行上面那个if取消掉
          this.selectAllChildrenTreeNode(childrenData,!key?'':(keyValue==key?"":key),item);
        }
      })
    },
    /**
     * optionList 数据数组,childKey 子级Key，当前父级parentData
     */
    selectAllParentTreeNode(item,allOptionList,optionList,childKey,parentData){
      const keyValueName = item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.value?item.useCtrlAttr.replaceFields.value:"value";
      const keyChildrenName = item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.children?item.useCtrlAttr.replaceFields.children:"children";
      const itemSelectedListKey = ","+item.selectedListKey.join(",")+",";
      optionList&&optionList.forEach(sitem=>{
        //当父级还是为空的时候，说明还是在查找子级
        if(childKey==sitem[keyValueName]){
          if(parentData){
            //父级存在,循环他的子级看看是否全部都选中了，如果选中了就把父级加上
            const childrenData = parentData[keyChildrenName];
            if(childrenData&&childrenData.length>0){
              let noExistsCount = 0;
              for (let index = 0; index < childrenData.length; index++) {
                const element = childrenData[index];
                if(itemSelectedListKey.indexOf(","+element[keyValueName]+",")==-1){
                  noExistsCount++;
                  break;
                }
              }
              if(noExistsCount==0){
                //选中
                let ssitem = _.cloneDeep(parentData);
                delete ssitem[keyChildrenName];
                item.selectedListKey.push(parentData[keyValueName]);
                item.selectedList.push(ssitem);
                //再次去用子级的方式查父级
                this.selectAllParentTreeNode(item,allOptionList,allOptionList,parentData[keyValueName]);
              }
            }
          }
        }else{
          //接着查找子级
          const childrenData = sitem[keyChildrenName];
          if(childrenData&&childrenData.length>0){
            this.selectAllParentTreeNode(item,allOptionList,childrenData,childKey,sitem);
          }
        }
      });
    },
    /**
     * 下拉框搜索选中项方法
     */
    dropDownSelect(e,item) {
      //e:{key: 'department_200807120024usH4cGf1OJxwicIW6Pk', label: ' 江西省商务委 '}
      console.log("🚀 ~ file: IControlSettingPanel.vue ~ line 725 ~ xzxselect ~ e", e,item)
      item.isSearching = false;
      var _this = this;
      item.dropdownOpening = true;
      //选中后需要对selectedKeys进行追加
      if(e&&e.key){
        if(!item.selectedListKey){
          item.selectedListKey = [];
        }
        if((","+item.selectedListKey.join(",")+",").indexOf(","+e.key+",")>-1){
          //选择的已存在，不进行选择，但还要重新赋值，不然还是会选上
          this.changePanelSelectOrderSetFormValue(item);
          return;
        }
        item.selectedListKey.push(e.key);
        item.selectOptionList&&item.selectOptionList.forEach(sitem=>{
          if(e.key==sitem[item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.value?item.useCtrlAttr.replaceFields.value:"value"]){
            item.selectedList.push(sitem);
          }
        });
        //选中所有子级
        this.selectAllChildrenTreeNode(item.useCtrlAttr.options,e.key,item);
        //逐层往上，判断当前所有一级的是否选中了，如果选中了这把父级也选中，如果选中则继续往上递归
        this.selectAllParentTreeNode(item,item.useCtrlAttr.options,item.useCtrlAttr.options,e.key)
        this.changePanelSelectOrder(item);
      }
    },

    openDropDownBox(item) {
      if (item.dropdownOpen) {
        return;
      }
      item.dropdownOpen = true;
      var _this = this;
      !item.eventClick?item.eventClick = function (e) {
        let refDom = _this.$refs[item.attrRef];
        if (refDom instanceof Array) {
          refDom = refDom[0];
        }
        if (refDom && !refDom.contains(e.target)) {
          setTimeout(() => {
            if (!item.dropdownOpening) {
              item.dropdownOpen = false;
              document.removeEventListener("click", item.eventClick);
            }
            item.dropdownOpening = false;
          }, 1);
        }
      }:null;
      setTimeout(() => {
        document.addEventListener("click", item.eventClick);
      }, 300);
    },
    onUserDeptSelect(selectedKeys, info) {
      console.log("onUserDeptSelect", selectedKeys,info);
      // this.selectedKeys = selectedKeys;
    },
    /**
     * 用户部门选中
     */
    onUserDeptCheck(selectedKeys, e,item) {
      console.log("onUserDeptCheck", selectedKeys,e,item);
      item.selectedListKey = selectedKeys;
      item.selectedList=[];
      selectedKeys&&selectedKeys.forEach(fkey=>{
        item.selectOptionList&&item.selectOptionList.forEach(sitem=>{
          if(fkey==sitem[item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.value?item.useCtrlAttr.replaceFields.value:"value"]){
            item.selectedList.push(sitem);
          }
        })
      })
      this.changePanelSelectOrder(item);
      // this.selectedKeys = selectedKeys;
    },
    /**
     * 清除用户部门选中的结果
     */
    clearUserDeptCheck(item){
      item.selectedListKey = [];
      item.selectedList=[];
      this.changePanelSelectOrder(item);
    },
    // /**
    //  * 面板选择的排序
    //  */
    // panelSelectSort(item) {
    //   item.selectedList = item.selectedList.sort((a, b) => a.order - b.order);
    // },
    /**
     * 面板已选择的关闭，item整个控件的，element是已选择的单个,index是已选择的索引
     */
    panelItemClose(item, element, index) {
      this.dropDownDeSelect({key:element[item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.value?item.useCtrlAttr.replaceFields.value:"value"]},item)
      
    },
    /**
     * 移除所有子节点数据
     * item：控件对象
     * optionList:子对象
     * keyValue:不为空代表要移除他的下级
     */
    removeAllChildrenData(item,optionList,keyValue){
      if(!item.selectedList||(item.selectedList&&item.selectedList.length==0)){
        return;
      }
      const keyValueName = item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.value?item.useCtrlAttr.replaceFields.value:"value";
      const keyChildrenName = item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.children?item.useCtrlAttr.replaceFields.children:"children";
      optionList&&optionList.forEach(sitem=>{
        //
        let existsIndex = -1;
        item.selectedList.forEach((iitem,iindex)=>{
          if(sitem[keyValueName]==iitem[keyValueName]){
            existsIndex = iindex;
            if(!keyValue){
              //此节点已选中，需要移除全部的子节点
              this.removeAllChildrenData(item,sitem[keyChildrenName],iitem[keyValueName])
            }
          }
        })
        if(keyValue){
          //要移除的状态
          existsIndex>-1&&item.selectedList.splice(existsIndex,1);
        }
        //继续查找下级
        if(sitem[keyChildrenName]&&sitem[keyChildrenName].length>0){
          this.removeAllChildrenData(item,sitem[keyChildrenName],keyValue)
        }
      })
    },
    /**
     * 移除所有的父节点，遇到选中且没有子节点的就保留，如果有子节点就移除
     */
    removeAllParentData(item,optionList){
      if(!item.selectedList||(item.selectedList&&item.selectedList.length==0)){
        return;
      }
      const keyValueName = item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.value?item.useCtrlAttr.replaceFields.value:"value";
      const keyChildrenName = item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.children?item.useCtrlAttr.replaceFields.children:"children";
      optionList&&optionList.forEach(sitem=>{
        let existsIndex = -1;
        item.selectedList.forEach((iitem,iindex)=>{
          if(sitem[keyValueName]==iitem[keyValueName]){
            existsIndex = iindex;
          }
        })
        const childrenData = sitem[keyChildrenName];
        if(existsIndex>-1&&childrenData&&childrenData.length>0){
          //存在子节点，直接移除
          item.selectedList.splice(existsIndex,1);
        }
        //继续查找下级
        if(childrenData&&childrenData.length>0){
          this.removeAllParentData(item,childrenData)
        }

      });
    },
    /**
     * 面板调整完了顺序
     */
    changePanelSelectOrder(item){
      //根据设置的showCheckedStrategy来确定如何进行显示
      //SHOW_CHILD 只显示子节点
      //SHOW_ALL  显示所有选中节点(包括父节点)
      //SHOW_PARENT 只显示父节点(当父节点下所有子节点都选中时)
      if(item.useCtrlAttr.showCheckedStrategy=="SHOW_CHILD"){
        //移除所有的父节点
        //用整个树结构去递归，遇到选中且没有子节点的就保留，如果有子节点就移除
        this.removeAllParentData(item,item.useCtrlAttr.options)
      }else if(item.useCtrlAttr.showCheckedStrategy=="SHOW_PARENT"){
        //移除所有的子节点
        //用整个树结构的数据去递归，遇到选中的就调用移除所有子节点的方法
        this.removeAllChildrenData(item,item.useCtrlAttr.options)
      }
      this.changePanelSelectOrderSetFormValue(item);
    },
    changePanelSelectOrderSetFormValue(item){
      var setParam = {};
      setParam[item.attrCode] = _.cloneDeep(item.selectedList);
      let that = this;
      //延迟设置，不然点击内部的删除无法实现重新设置
      setTimeout(() => {
        that.form.setFieldsValue(setParam);
      }, 10);
    },
    /**
     * 面板选择
     * item 整条数据对象
     * element 单个点击的对象
     * type 事件类型，mb代表面板点击的，all代表全选，unall取消全选
     */
    panelSelectCheck(item,element,type){
      //先判断value是否选中，没有选中就追加到已选中里面，选中了就从已选中移除，并且每次都重新this.form.setFieldsValue({filed:value}});
      let selectedList = item.selectedList;
      if(!item.selectedList){
        item.selectedList = [];
      }
      if(element){
        const isExistsIndex = this.getPanelSelectCheck(item,element);
        if(isExistsIndex>-1){
          //存在移除
          item.selectedList.splice(isExistsIndex,1);
        }else{
          item.selectedList.push(element);
        }
      }else if(type=="all"){
        item.useCtrlAttr&&item.useCtrlAttr.options&&item.useCtrlAttr.options.forEach(sitem=>{
          const isExistsIndex = this.getPanelSelectCheck(item,sitem);
          if(isExistsIndex==-1){
            item.selectedList.push(sitem);
          }
        })
      }else if(type=="unall"){
        item.selectedList = [];
      }
      console.log(item)
      var setParam = {};
      setParam[item.attrCode] = _.cloneDeep(item.selectedList);
      this.form.setFieldsValue(setParam);
    },
    /**
     * 获取是否选中
     */
    getPanelSelectCheck(item,element){
      let result = -1;
      item&&item.selectedList&&item.selectedList.forEach((sitem,sindex)=>{
        if(sitem.value==element.value){
          result = sindex;
        }
      });
      return result;
    },
    /**
     * 颜色面板颜色选择改变
     */
    colorPickerChange(value, item) {
      console.log("-------------颜色改变", value, item);
      item.colors = value.hex8;
      var setParam = {};
      setParam[item.attrCode] = value.hex8;
      this.form.setFieldsValue(setParam);
    },
    /**
     * 颜色文本框自定义改变
     */
    colorInputChange(e, item) {
      let val = e.target.value;
      item.colors = val;
    },
    /**
     * 加载设置中心初始化数据
     */
    async initData() {
      let that = this;
      let resData;
      await window.IDM.http
        .get(this.propData.ctrlDataIntelface, this.commonParam())
        .then((res) => {
            res.data&&res.data.data &&
              res.data.data.forEach((item) => {
                item.attrRef = "ref_" + item.id;
                item.isSearching = false;
                item.dropdownOpen = false;
                item.selectedList = [];
                item.selectedListKey = [];
                item.colors = "";
                if (item.useCtrlAttr) {
                  try {
                    item.useCtrlAttr = JSON.parse(item.useCtrlAttr);
                  } catch (error) {
                    item.useCtrlAttr = {};
                  }
                } else {
                  item.useCtrlAttr = {};
                }
              });
            resData = res.data.data;
        });

      if(resData&&resData.length>0){
        for (let index = 0; index < resData.length; index++) {
          const element = resData[index];
          await this.loadAllCtrlOption(element);
        }
        // await Promise.all(resData.forEach(async (item)=>{
        //   await this.loadAllCtrlOption(item);
        // }))
      }
      this.formControlDataList = resData;
      console.log(this.formControlDataList)
    },
    /**
     * 要按照await方式请求执行完每个控件属性的各种类型
     */
    async loadAllCtrlOption(itemObject){
      //dataType:"数据请求类型，code：请求数据代码值，options：代表直接使用静态数据，url：接口地址，sql：sql语句方式"
      if(itemObject&&itemObject.useCtrlAttr&&itemObject.useCtrlAttr.dataType){
        let resultOptions,paramObject = {...this.commonParam()};
        switch (itemObject.useCtrlAttr.dataType) {
          case "code":
            await window.IDM.http
            .get(this.propData.codeDataIntelface, {...this.commonParam(),"codeKeys":itemObject.useCtrlAttr.codeId})
            .then((res) => {
              //显示字段能自定义
              resultOptions = res.data;
            });
            break;
          case "url":
            if(itemObject.useCtrlAttr.customParam){
              paramObject = {...paramObject,...itemObject.useCtrlAttr.customParam}
            }
            await window.IDM.http[itemObject.useCtrlAttr.interfaceType||'get'](itemObject.useCtrlAttr.interfaceUrl, paramObject)
            .then((res) => {
              //显示字段能自定义
              resultOptions = res.data;
            });
            break;
          case "sql":
            if(itemObject.useCtrlAttr.customParam){
              paramObject = {...paramObject,...itemObject.useCtrlAttr.customParam}
            }
            if(itemObject.useCtrlAttr.metaKey){
              paramObject["metaKey"]=itemObject.useCtrlAttr.metaKey;
            }
            await window.IDM.http[itemObject.useCtrlAttr.interfaceType||'get'](this.propData.sqlDataIntelface, paramObject)
            .then((res) => {
              //显示字段能自定义
              resultOptions = res.data;
            });
            break;
        }
        if(resultOptions){
          const showFiledName = itemObject.useCtrlAttr.showFiledName||"data";
          let optionList=[];
          try {
            optionList = this.replaceExpData(showFiledName,"resultData",resultOptions);
          } catch (error) {
            
          }
          if(itemObject.useCtrlAttr.replaceFields){
            const replaceFields = itemObject.useCtrlAttr.replaceFields;
            const replaceArray = ["title","key","value","disabled","label"];
            optionList.forEach(item=>{
              replaceArray.forEach(valItem=>{
                if(replaceFields[valItem]){
                  item[valItem] = item[replaceFields[valItem]]
                }
              })
            })
          }
          itemObject.useCtrlAttr.options = optionList;
        }
        //判断如果是用户/部门选择、代码选择需要把数据转化为平级结构
        if(itemObject.useCtrlId=='userSelect' || itemObject.useCtrlId == 'codeSelect'){
          //平面转化存储为selectOptionList
          if(!itemObject.selectOptionList){
            itemObject.selectOptionList = [];
          }
          this.findStr = ",";
          this.switchTreeDataToOptionList(itemObject.useCtrlAttr.options,itemObject)
          this.findStr = "";
        }
      }
    },
    switchTreeDataToOptionList(dataList,item){
      dataList.forEach(ditem=>{
        //去除重复过滤的下
        const dKey = ditem[item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.value?item.useCtrlAttr.replaceFields.value:"value"];
        if(this.findStr.indexOf(","+dKey+",")==-1){
          
          if(item.useCtrlAttr.replaceFields){
            const replaceFields = item.useCtrlAttr.replaceFields;
            const replaceArray = ["title","key","value","disabled","label"];
            replaceArray.forEach(valItem=>{
              if(replaceFields[valItem]){
                ditem[valItem] = ditem[replaceFields[valItem]]
              }
            })
          }
          const nditem = _.cloneDeep(ditem);
          delete nditem[item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.children?item.useCtrlAttr.replaceFields.children:"children"];

          item.selectOptionList.push(nditem);
          this.findStr=this.findStr+dKey+",";
        }
        const dchildren = ditem[item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.children?item.useCtrlAttr.replaceFields.children:"children"];
        if(dchildren){
          this.switchTreeDataToOptionList(dchildren,item)
        }
      })
    },
    /**
     * 替换表达式的数据
     */
    replaceExpData(filedExpression,dataName,resultData){
      //给defaultValue设置dataFiled的值
      var filedExp = filedExpression;
      filedExp =
        dataName +
        (filedExp.startsWiths("[") ? "" : ".") +
        filedExp;
      var dataObject = { IDM: window.IDM };
      dataObject[dataName] = resultData;
      return window.IDM.express.replace.call(
        this,
        "@[" + filedExp + "]",
        dataObject
      );
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    async propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      await this.initAttrToModule();
      console.log("组件内属性发生变化，变化后====》", this.propData);
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject() {
      var styleObject = {};
      if (this.propData.bgSize && this.propData.bgSize == "custom") {
        styleObject["background-size"] =
          (this.propData.bgSizeWidth
            ? this.propData.bgSizeWidth.inputVal +
              this.propData.bgSizeWidth.selectVal
            : "auto") +
          " " +
          (this.propData.bgSizeHeight
            ? this.propData.bgSizeHeight.inputVal +
              this.propData.bgSizeHeight.selectVal
            : "auto");
      } else if (this.propData.bgSize) {
        styleObject["background-size"] = this.propData.bgSize;
      }
      if (this.propData.positionX && this.propData.positionX.inputVal) {
        styleObject["background-position-x"] =
          this.propData.positionX.inputVal + this.propData.positionX.selectVal;
      }
      if (this.propData.positionY && this.propData.positionY.inputVal) {
        styleObject["background-position-y"] =
          this.propData.positionY.inputVal + this.propData.positionY.selectVal;
      }
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "width":
            case "height":
              styleObject[key] = element;
              break;
            case "bgColor":
              if (element && element.hex8) {
                styleObject["background-color"] = element.hex8;
              }
              break;
            case "box":
              if (element.marginTopVal) {
                styleObject["margin-top"] = `${element.marginTopVal}`;
              }
              if (element.marginRightVal) {
                styleObject["margin-right"] = `${element.marginRightVal}`;
              }
              if (element.marginBottomVal) {
                styleObject["margin-bottom"] = `${element.marginBottomVal}`;
              }
              if (element.marginLeftVal) {
                styleObject["margin-left"] = `${element.marginLeftVal}`;
              }
              if (element.paddingTopVal) {
                styleObject["padding-top"] = `${element.paddingTopVal}`;
              }
              if (element.paddingRightVal) {
                styleObject["padding-right"] = `${element.paddingRightVal}`;
              }
              if (element.paddingBottomVal) {
                styleObject["padding-bottom"] = `${element.paddingBottomVal}`;
              }
              if (element.paddingLeftVal) {
                styleObject["padding-left"] = `${element.paddingLeftVal}`;
              }
              break;
            case "bgImgUrl":
              styleObject[
                "background-image"
              ] = `url(${window.IDM.url.getWebPath(element)})`;
              break;
            case "positionX":
              //背景横向偏移

              break;
            case "positionY":
              //背景纵向偏移

              break;
            case "bgRepeat":
              //平铺模式
              styleObject["background-repeat"] = element;
              break;
            case "bgAttachment":
              //背景模式
              styleObject["background-attachment"] = element;
              break;
            case "border":
              if (element.border.top.width > 0) {
                styleObject["border-top-width"] =
                  element.border.top.width + element.border.top.widthUnit;
                styleObject["border-top-style"] = element.border.top.style;
                if (element.border.top.colors.hex8) {
                  styleObject["border-top-color"] =
                    element.border.top.colors.hex8;
                }
              }
              if (element.border.right.width > 0) {
                styleObject["border-right-width"] =
                  element.border.right.width + element.border.right.widthUnit;
                styleObject["border-right-style"] = element.border.right.style;
                if (element.border.right.colors.hex8) {
                  styleObject["border-right-color"] =
                    element.border.right.colors.hex8;
                }
              }
              if (element.border.bottom.width > 0) {
                styleObject["border-bottom-width"] =
                  element.border.bottom.width + element.border.bottom.widthUnit;
                styleObject["border-bottom-style"] =
                  element.border.bottom.style;
                if (element.border.bottom.colors.hex8) {
                  styleObject["border-bottom-color"] =
                    element.border.bottom.colors.hex8;
                }
              }
              if (element.border.left.width > 0) {
                styleObject["border-left-width"] =
                  element.border.left.width + element.border.left.widthUnit;
                styleObject["border-left-style"] = element.border.left.style;
                if (element.border.left.colors.hex8) {
                  styleObject["border-left-color"] =
                    element.border.left.colors.hex8;
                }
              }

              styleObject["border-top-left-radius"] =
                element.radius.leftTop.radius +
                element.radius.leftTop.radiusUnit;
              styleObject["border-top-right-radius"] =
                element.radius.rightTop.radius +
                element.radius.rightTop.radiusUnit;
              styleObject["border-bottom-left-radius"] =
                element.radius.leftBottom.radius +
                element.radius.leftBottom.radiusUnit;
              styleObject["border-bottom-right-radius"] =
                element.radius.rightBottom.radius +
                element.radius.rightBottom.radiusUnit;
              break;
            case "font":
              styleObject["font-family"] = element.fontFamily;
              if (element.fontColors.hex8) {
                styleObject["color"] = element.fontColors.hex8;
              }
              styleObject["font-weight"] =
                element.fontWeight && element.fontWeight.split(" ")[0];
              styleObject["font-style"] = element.fontStyle;
              styleObject["font-size"] =
                element.fontSize + element.fontSizeUnit;
              styleObject["line-height"] =
                element.fontLineHeight +
                (element.fontLineHeightUnit == "-"
                  ? ""
                  : element.fontLineHeightUnit);
              styleObject["text-align"] = element.fontTextAlign;
              styleObject["text-decoration"] = element.fontDecoration;
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToBtnBoxStyleObject() {
      if(this.propData.ctrlButtonPosition=="formlast"){
        return;
      }
      var styleObject = {};
      if (this.propData.btnBgSize && this.propData.btnBgSize == "custom") {
        styleObject["background-size"] =
          (this.propData.btnBgSizeWidth
            ? this.propData.btnBgSizeWidth.inputVal +
              this.propData.btnBgSizeWidth.selectVal
            : "auto") +
          " " +
          (this.propData.btnBgSizeHeight
            ? this.propData.btnBgSizeHeight.inputVal +
              this.propData.btnBgSizeHeight.selectVal
            : "auto");
      } else if (this.propData.btnBgSize) {
        styleObject["background-size"] = this.propData.btnBgSize;
      }
      if (this.propData.btnPositionX && this.propData.btnPositionX.inputVal) {
        styleObject["background-position-x"] =
          this.propData.btnPositionX.inputVal + this.propData.btnPositionX.selectVal;
      }
      if (this.propData.btnPositionY && this.propData.btnPositionY.inputVal) {
        styleObject["background-position-y"] =
          this.propData.btnPositionY.inputVal + this.propData.btnPositionY.selectVal;
      }
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "btnShadow":
                styleObject["box-shadow"] = element;
              break;
            case "btnBgColor":
              if (element && element.hex8) {
                styleObject["background-color"] = element.hex8;
              }
              break;
            case "btnBox":
              if (element.marginTopVal) {
                styleObject["margin-top"] = `${element.marginTopVal}`;
              }
              if (element.marginRightVal) {
                styleObject["margin-right"] = `${element.marginRightVal}`;
              }
              if (element.marginBottomVal) {
                styleObject["margin-bottom"] = `${element.marginBottomVal}`;
              }
              if (element.marginLeftVal) {
                styleObject["margin-left"] = `${element.marginLeftVal}`;
              }
              if (element.paddingTopVal) {
                styleObject["padding-top"] = `${element.paddingTopVal}`;
              }
              if (element.paddingRightVal) {
                styleObject["padding-right"] = `${element.paddingRightVal}`;
              }
              if (element.paddingBottomVal) {
                styleObject["padding-bottom"] = `${element.paddingBottomVal}`;
              }
              if (element.paddingLeftVal) {
                styleObject["padding-left"] = `${element.paddingLeftVal}`;
              }
              break;
            case "btnBgImgUrl":
              styleObject[
                "background-image"
              ] = `url(${window.IDM.url.getWebPath(element)})`;
              break;
            case "btnBgRepeat":
              //平铺模式
              styleObject["background-repeat"] = element;
              break;
            case "btnBgAttachment":
              //背景模式
              styleObject["background-attachment"] = element;
              break;
            case "btnBorder":
              if (element.border.top.width > 0) {
                styleObject["border-top-width"] =
                  element.border.top.width + element.border.top.widthUnit;
                styleObject["border-top-style"] = element.border.top.style;
                if (element.border.top.colors.hex8) {
                  styleObject["border-top-color"] =
                    element.border.top.colors.hex8;
                }
              }
              if (element.border.right.width > 0) {
                styleObject["border-right-width"] =
                  element.border.right.width + element.border.right.widthUnit;
                styleObject["border-right-style"] = element.border.right.style;
                if (element.border.right.colors.hex8) {
                  styleObject["border-right-color"] =
                    element.border.right.colors.hex8;
                }
              }
              if (element.border.bottom.width > 0) {
                styleObject["border-bottom-width"] =
                  element.border.bottom.width + element.border.bottom.widthUnit;
                styleObject["border-bottom-style"] =
                  element.border.bottom.style;
                if (element.border.bottom.colors.hex8) {
                  styleObject["border-bottom-color"] =
                    element.border.bottom.colors.hex8;
                }
              }
              if (element.border.left.width > 0) {
                styleObject["border-left-width"] =
                  element.border.left.width + element.border.left.widthUnit;
                styleObject["border-left-style"] = element.border.left.style;
                if (element.border.left.colors.hex8) {
                  styleObject["border-left-color"] =
                    element.border.left.colors.hex8;
                }
              }

              styleObject["border-top-left-radius"] =
                element.radius.leftTop.radius +
                element.radius.leftTop.radiusUnit;
              styleObject["border-top-right-radius"] =
                element.radius.rightTop.radius +
                element.radius.rightTop.radiusUnit;
              styleObject["border-bottom-left-radius"] =
                element.radius.leftBottom.radius +
                element.radius.leftBottom.radiusUnit;
              styleObject["border-bottom-right-radius"] =
                element.radius.rightBottom.radius +
                element.radius.rightBottom.radiusUnit;
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id+" .idm-control-center-bottom-fixed", styleObject);
    },
    /**
     * 加载基本属性
     */
    async initBaseAttrToModule() {
      await this.initData();
      this.$nextTick(function(){
        this.initDefaultDataToForm();
      })
    },
    //加载表单默认值
    initDefaultDataToForm(){
      var setParam = {};
      this.formControlDataList&&this.formControlDataList.forEach(item=>{
        if(!item.defaultValue){
          return
        }
        switch (item.useCtrlId) {
          case "panelSelect":
          case "userSelect":
          case "codeSelect":
          case "treeSelect":
          case "upload":
          case "select":
          case "cascader":
          case "checkbox":
            try {
              setParam[item.attrCode] = JSON.parse(item.defaultValue);
            } catch (error) {
              
            }
            break;
          case "switch":
            try {
              setParam[item.attrCode] = eval(item.defaultValue);
            } catch (error) {
              
            }
            break;
          default:
            setParam[item.attrCode] = item.defaultValue;
            break;
        }
        
        if(item.useCtrlId=="panelSelect"||item.useCtrlId=="userSelect"||item.useCtrlId=="codeSelect"){
          const attrData = setParam[item.attrCode];
          if(typeof attrData === "object"){
            item.selectedList = attrData;
          }
          if(!item.selectedListKey){
            item.selectedListKey = [];
          }
          const keyValueName = item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.value?item.useCtrlAttr.replaceFields.value:"value";
          item.selectedList.forEach(sitem=>{
            item.selectedListKey.push(sitem[keyValueName]);
          })
          if(item.useCtrlId!="panelSelect"){
            this.changePanelSelectOrder(item);
          }
        }else if(item.useCtrlId=="colorPicker"){
          item.colors = setParam[item.attrCode]||"";
        }
      });
      this.form.setFieldsValue(setParam);
    },
    /**
     * 加载表单数据到页面中
     */
    async initFormDataToPage(){
      if(!this.propData.fetchDataIntelfaceUrl){
        return;
      }
      let that = this;
      let resData;
      await window.IDM.http
        .get(this.propData.fetchDataIntelfaceUrl, this.commonParam())
        .then((res) => {
            resData = res.data;
        });
      var fetchDataRunLaterFunction = this.propData.fetchDataRunLaterFunction;
      fetchDataRunLaterFunction&&fetchDataRunLaterFunction.forEach(item=>{
        resData = window[item.name]&&window[item.name].call(this,{
          urlData:urlObject,
          pageId,
          customParam:item.param,
          _this:this,
          resultData:resData
        });
      })
      //回显设置数据
      const objectListData = this.replaceExpData(this.propData.fetchDataShowField,"resultData",resData);
      objectListData&&objectListData.forEach(item=>{
        if(item.attrCode){
          var setParam = {};
          this.formControlDataList&&this.formControlDataList.forEach(sitem=>{
            if(sitem.attrCode==item.attrCode){
              switch (sitem.useCtrlId) {
                case "panelSelect":
                case "userSelect":
                case "codeSelect":
                case "treeSelect":
                case "upload":
                case "select":
                case "cascader":
                case "checkbox":
                  try {
                    setParam[item.attrCode] = JSON.parse(item.attrData);
                  } catch (error) {
                    
                  }
                  break;
                case "switch":
                  try {
                    setParam[item.attrCode] = eval(item.attrData);
                  } catch (error) {
                    
                  }
                  break;
                default:
                  setParam[item.attrCode] = item.attrData;
                  break;
              }
            }
          });
          this.form.setFieldsValue(setParam);
        }
      })
      //绑定完后，需要把panelSelect userSelect codeSelect  设置 selectedList、  selectedListKey
      this.formControlDataList&&this.formControlDataList.forEach(item=>{
        if(item.useCtrlId=="panelSelect"||item.useCtrlId=="userSelect"||item.useCtrlId=="codeSelect"){
          const attrData = this.form.getFieldValue(item.attrCode);
          if(typeof attrData === "object"){
            item.selectedList = attrData;
          }
          if(!item.selectedListKey){
            item.selectedListKey = [];
          }
          const keyValueName = item.useCtrlAttr.replaceFields&&item.useCtrlAttr.replaceFields.value?item.useCtrlAttr.replaceFields.value:"value";
          item.selectedList.forEach(sitem=>{
            item.selectedListKey.push(sitem[keyValueName]);
          })
          if(item.useCtrlId!="panelSelect"){
            this.changePanelSelectOrder(item);
          }
        }else if(item.useCtrlId=="colorPicker"){
          item.colors = this.form.getFieldValue(item.attrCode)||"";
        }
      })
    },
    /**
     * 加载属性到组件中
     */
    async initAttrToModule() {
      this.convertAttrToStyleObject();
      this.convertAttrToBtnBoxStyleObject();
      await this.initBaseAttrToModule();
      await this.initFormDataToPage();
      this.spinning = false;
    },
    /**
     * 通用的url参数对象
     * 所有地址的url参数转换
     */
    commonParam() {
      let urlObject = IDM.url.queryObject();
      var params = {
        pageId:
          window.IDM.broadcast && window.IDM.broadcast.pageModule
            ? window.IDM.broadcast.pageModule.id
            : "",
        urlData: JSON.stringify(urlObject),
      };
      return params;
    },
    /**
     * 组件通信：接收消息的方法
     * @param {
     *  type:"发送消息的时候定义的类型，这里可以自己用来要具体做什么，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
     * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）"
     *  message:{发送的时候传输的消息对象数据}
     *  messageKey:"消息数据的key值，代表数据类型是什么，常用于表单交互上，比如通过这个key判断是什么数据"
     *  isAcross:如果为true则代表发送来源是其他页面的组件，默认为false
     * } object
     */
    receiveBroadcastMessage(object) {
      console.log("组件收到消息", object);
    },
    /**
     * 组件通信：发送消息的方法
     * @param {
     *  type:"自己定义的，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
     * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）",
     *  message:{实际的消息对象},
     *  rangeModule:"为空发送给全部，根据配置的属性中设定的值（值的内容是组件的packageid数组），不取子表的，比如直接 this.$root.propData.compositeAttr["attrKey"]（注意attrKey是属性中定义的bindKey）,这里的格式为：['1','2']"",
     *  className:"指定的组件类型，比如只给待办组件发送，然后再去过滤上面的值"
     *  globalSend:如果为true则全站发送消息，注意全站rangeModule是无效的，只有className才有效，默认为false
     * } object
     */
    sendBroadcastMessage(object) {
      window.IDM.broadcast && window.IDM.broadcast.send(object);
    },
  },
};
</script>
<style lang="scss" scoped>
.idm_control_setting_panel{
  position: relative;
}
.idm_control_center_popover {
    .vc-sketch {
      padding: 0px;
      background: transparent;
      border-radius: 0px;
      box-shadow: none;
    }
    .vc-sketch-field .vc-input__input {
      background: transparent;
      width: 100%;
    }
  }
  .idm_control_center_colorpicker_icon {
    width: 16px;
    height: 16px;
  }
  
  .control-center-panel-select-ghost {
    opacity: 0.5;
    background: #d9d9d9 !important;
  }
  .control-center-panel-select-group,
  .control-center-panel-select-popover {
    padding: 0;
    margin: 0;
    .control-center-panel-select-group-item {
      list-style: none;
      display: inline-block;
      height: 32px;
      padding: 0 10px;
      line-height: 30px;
      font-size: 14px;
      border-radius: 4px;
      box-sizing: border-box;
      white-space: nowrap;
      cursor: move;
      margin-right: 10px;
      color: rgba(0, 0, 0, 0.65);
      background-color: #fff;
      border: 1px solid #d9d9d9;
      margin-bottom: 5px;
    }
    .control-center-panel-select-group-close {
      margin-left: 8px;
      cursor: pointer;
    }
    .control-center-panel-select-add {
      color: #40a9ff;
      background-color: #fff;
      border-color: #40a9ff;
      line-height: 30px;
    }
  }
  .control-center-panel-select-popover {
    max-width: 450px;
    .control-center-panel-select-group-item {
      margin-bottom: 10px;
      position: relative;
      cursor: pointer;
      transition: all linear 0.3s;
      &.select-active {
        opacity: 0.4;
      }
      &:hover{
        color: #40a9ff;
        border-color: #40a9ff;
      }
    }
    .control-center-panel-select-group-check {
      position: absolute;
      right: 2px;
      bottom: 2px;
      font-size: 8px;
      display: none;
    }
    .control-center-panel-select-footer {
      display: flex;
      justify-content: space-between;
      .control-center-panel-select-desc {
        font-size: 12px;
        color: #999;
      }
      & > *:last-child {
        text-align: right;
      }
    }
  }
  .control-setting-userselect-panel {
    display: flex;
    height: 300px;
    & > div {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      .right-selected-box {
        flex-grow: 2;
        overflow: auto;
      }
      .footer-check-number {
        right: 0px;
        bottom: 0px;
        font-size: 14px;
        color: #999;
        text-align: right;
        display: flex;
        height: 30px;
        line-height: 30px;
        background-color: #fff;
        justify-content: space-between;
        padding: 0px 10px;
        white-space: nowrap;
      }
    }
    & > div:first-child {
      width: 60%;
      border-right: 1px solid #d9d9d9;
      overflow: auto;
    }
    & > div:last-child {
      width: 40%;
    }
    .control-center-userdept-select-group {
      padding: 0;
      margin: 0;
      .control-center-userdept-select-group-item {
        display: block;
        height: 32px;
        padding: 0 30px 0px 10px;
        line-height: 32px;
        font-size: 14px;
        box-sizing: border-box;
        white-space: nowrap;
        cursor: move;
        color: rgba(0, 0, 0, 0.65);
        background-color: #fff;
        position: relative;
        width: 100%;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .control-center-userdept-select-group-close {
        margin-left: 8px;
        cursor: pointer;
        position: absolute;
        right: 10px;
        line-height: initial;
        top: 9px;
      }
    }
  }
  .idm-control-center-form{
    min-height: 100px;
  }
  .idm-control-center-form.ant-form-inline{
    .idm-control-center-slider,.idm-control-center-select{
      .ant-form-item-control-wrapper{
        min-width: 160px;
      }
    }
    .idm-control-center-treeSelect{
      .ant-form-item-control-wrapper{
        min-width: 200px;
      }
    }
    .idm-control-center-userSelect,.idm-control-center-codeSelect{
      .ant-form-item-control-wrapper{
        min-width: 250px;
      }
    }
  }
  .idm-control-center-userselect-dropdown{
    min-width: 450px;
  }
  .idm-control-center-bottom-fixed{
    position: fixed;
    &.env_develop{
        position: absolute;
    }
    left: 0px;
    right: 0px;
    padding: 10px;
    background-color: #ffffff;
    box-shadow: 0 0px 10px rgb(0 0 0 / 10%);
    z-index: 10;
    &.cc-btn-left{
      text-align: left;
    }
    &.cc-btn-center{
      text-align: center;
    }
    &.cc-btn-right{
      text-align: right;
    }
    &.cc-btn-position-fixedTop{
      top: 0px;
    }
    &.cc-btn-position-fixedBottom{
      bottom: 0px;
    }
  }
  .cc-btn-box-common{
    &>*{
      margin-left: 10px;
      &:first-child{
        margin-left: 0px;
      }
    }
    &.cc-btn-left{
      text-align: left;
    }
    &.cc-btn-center{
      text-align: center;
    }
    &.cc-btn-right{
      text-align: right;
    }
  }
</style>