import {
  create,
  NMessageProvider,
  NDialogProvider,
  NConfigProvider,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NButton,
  NForm,
  NFormItem,
  NIcon,
  NImage,
  NImageGroup,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NLayoutSider,
  NMenu,
  NDropdown,
  NSpace,
  NTooltip,
  NAvatar,
  NDivider,
  NSwitch,
  NBadge,
  NElement,
  NTag,
  NDynamicTags,
  NP,
  NText,
  NH1,
  NH2,
  NH3,
  NOl,
  NUl,
  NLi,
  NA,
  NProgress,
  NDataTable,
  NPopover,
  NSelect,
  NResult,
  NTable,
  NLoadingBarProvider,
  NUpload,
  NUploadDragger,
  NSpin,
  NBackTop,
  NSkeleton,
  NScrollbar,
  NPopselect,
  NFlex,
  NPagination,
  NDatePicker,
  NModal,
  NCard,
} from 'naive-ui';

// https://www.naiveui.com/en-US/os-theme/docs/import-on-demand
const naive = create({
  components: [
    NMessageProvider,
    NDialogProvider,
    NConfigProvider,
    NInput,
    NInputGroup,
    NInputGroupLabel,
    NButton,
    NForm,
    NFormItem,
    NIcon,
    NImage,
    NImageGroup,
    NLayout,
    NLayoutHeader,
    NLayoutContent,
    NLayoutFooter,
    NLayoutSider,
    NMenu,
    NDropdown,
    NSpace,
    NTooltip,
    NAvatar,
    NDivider,
    NSwitch,
    NBadge,
    NElement,
    NTag,
    NDynamicTags,
    NP,
    NText,
    NH1,
    NH2,
    NH3,
    NOl,
    NUl,
    NLi,
    NA,
    NProgress,
    NDataTable,
    NPopover,
    NSelect,
    NResult,
    NTable,
    NLoadingBarProvider,
    NUpload,
    NUploadDragger,
    NSpin,
    NBackTop,
    NSkeleton,
    NScrollbar,
    NPopselect,
    NFlex,
    NPagination,
    NDatePicker,
    NModal,
    NCard,
  ],
});

export function setupNaive(app) {
  app.use(naive);
}
