import { Modal, Form, Input } from "antd"
import enhanceModal, { EnhanceUnifiedModalProps } from "../EnhanceModal"
import { type BlogFolder, updateFolder } from "@/requests/folder"
import { useState, useCallback, useEffect } from "react"

type ModalFolderEditProps = EnhanceUnifiedModalProps<{
  folderInfo: BlogFolder
}, BlogFolder>

function ModalFolderEdit(props: ModalFolderEditProps) {
  const { folderInfo, onCancel, open, onOk } = props
  const [form] = Form.useForm()

  const handleOk = useCallback(() => {
    return form.validateFields().then(values => {
      const { id } = folderInfo
      onOk?.({ title: values.title, desc_info: values.desc, id })
    })
  }, [folderInfo, form, onOk])

  useEffect(() => {
    const { desc_info, title } = folderInfo
    form.setFieldsValue({ title, desc: desc_info })
  }, [folderInfo, form])

  return <Modal
    open={open}
    onCancel={onCancel}
    title="编辑文件夹"
    onOk={handleOk}
  >
    <Form
      form={form}
      layout="vertical"
    >
      <Form.Item
        name="title"
        label="文件夹名称"
        rules={[
          { required: true, message: '请输入文件夹名称' },
          { min: 1, max: 199, message: '文件夹名称长度需在1-199之间' }
        ]}
      >
        <Input placeholder="请输入文件夹名称" />
      </Form.Item>
      <Form.Item
        name="desc"
        label="文件夹描述"
        rules={[
          { max: 254, message: '文件夹描述长度不能超过254个字符' }
        ]}
      >
        <Input.TextArea placeholder="请输入文件夹描述" />
      </Form.Item>
    </Form>
  </Modal>
}
export default enhanceModal<ModalFolderEditProps, BlogFolder>(ModalFolderEdit)
