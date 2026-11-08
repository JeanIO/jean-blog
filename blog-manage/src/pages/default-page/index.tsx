import { Card, Col, Progress, Row, Statistic, Table, Tag } from "antd";
import {
  CheckCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import "./index.less";

// ============ 静态演示数据：后续接入 GET /api/dashboard/stats 后删除 ============

const KPI_DATA = [
  { title: "总阅读量", value: 12866, icon: <EyeOutlined />, color: "#1677ff" },
  { title: "博客总数", value: 56, icon: <FileTextOutlined />, color: "#52c41a" },
  { title: "已发布", value: 41, icon: <CheckCircleOutlined />, color: "#faad14" },
  { title: "知识库数", value: 4, icon: <FolderOutlined />, color: "#eb2f96" },
];

// 标签分布（占位数据：表里还没有标签字段，先按"标签"的样子摆，方案待定）
const TAG_STATS = [
  { name: "JavaScript", count: 32 },
  { name: "TypeScript", count: 24 },
  { name: "React", count: 18 },
  { name: "MySQL", count: 15 },
  { name: "算法", count: 12 },
  { name: "CSS", count: 9 },
  { name: "Node", count: 7 },
  { name: "面试", count: 6 },
];

const TOP_BLOGS = [
  { rank: 1, title: "前端路由原理与实践", viewTimes: 1280 },
  { rank: 2, title: "MySQL 索引优化笔记", viewTimes: 986 },
  { rank: 3, title: "React Hooks 深入理解", viewTimes: 875 },
  { rank: 4, title: "手写 Promise 从零到一", viewTimes: 743 },
  { rank: 5, title: "TypeScript 类型体操入门", viewTimes: 651 },
  { rank: 6, title: "HTTP 缓存机制总结", viewTimes: 598 },
  { rank: 7, title: "二叉树遍历题解合集", viewTimes: 512 },
  { rank: 8, title: "Flex 布局完全指南", viewTimes: 468 },
  { rank: 9, title: "Node.js 事件循环详解", viewTimes: 431 },
  { rank: 10, title: "CSS 选择器优先级", viewTimes: 377 },
];

const columns: any[] = [
  { title: "标题", dataIndex: "title", render: (text: string) => <a>{text}</a> },
  { title: "所属知识库", dataIndex: "folder", render: (text: string) => <Tag color="blue">{text}</Tag> },
  { title: "更新时间", dataIndex: "updateDate", width: 200 },
  {
    title: "状态",
    dataIndex: "published",
    width: 120,
    render: (published: boolean) =>
      published ? <Tag color="success">已发布</Tag> : <Tag>未发布</Tag>,
  },
];

const RECENT_BLOGS = [
  { key: "1", title: "手写 Promise 从零到一", folder: "前端知识库", updateDate: "2026-11-04 22:10", published: true },
  { key: "2", title: "MySQL 索引优化笔记", folder: "数据库知识库", updateDate: "2026-11-04 18:30", published: true },
  { key: "3", title: "面试八股文整理（草稿）", folder: "面试知识库", updateDate: "2026-11-03 15:45", published: false },
  { key: "4", title: "秋招复盘", folder: "生活随笔", updateDate: "2026-11-02 09:12", published: true },
  { key: "5", title: "TypeScript 泛型详解", folder: "前端知识库", updateDate: "2026-11-01 21:00", published: true },
  { key: "6", title: "事务隔离级别总结", folder: "数据库知识库", updateDate: "2026-10-30 14:20", published: false },
];

// ================================================================

export default function HomePage() {
  const maxTagCount = Math.max(...TAG_STATS.map((t) => t.count));

  return (
    <div className="dashboard">
      {/* KPI 统计卡 */}
      <Row gutter={16}>
        {KPI_DATA.map((item) => (
          <Col span={6} key={item.title}>
            <Card className="dashboard-card kpi-card">
              <Statistic title={item.title} value={item.value} />
              <div className="kpi-icon" style={{ color: item.color }}>{item.icon}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        {/* 标签分布 */}
        <Col span={16}>
          <Card className="dashboard-card" title="标签分布">
            {TAG_STATS.map((tag) => (
              <div className="tag-bar" key={tag.name}>
                <Tag className="tag-name" color="blue">{tag.name}</Tag>
                <Progress
                  className="tag-progress"
                  strokeColor="#1677ff"
                  strokeWidth={6}
                  percent={Math.round((tag.count / maxTagCount) * 100)}
                  format={() => `${tag.count} 篇`}
                />
              </div>
            ))}
          </Card>
        </Col>

        {/* 阅读量 Top 10 */}
        <Col span={8}>
          <Card className="dashboard-card" title="阅读量 Top 10">
            <div className="top-list">
              {TOP_BLOGS.map((blog) => (
                <div className="top-item" key={blog.rank}>
                  <span className={`top-rank rank-${blog.rank}`}>{blog.rank}</span>
                  <span className="top-title" title={blog.title}>{blog.title}</span>
                  <span className="top-views"><EyeOutlined /> {blog.viewTimes}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近更新 */}
      <Row gutter={16}>
        <Col span={24}>
          <Card className="dashboard-card" title="最近更新">
            <Table
              size="small"
              columns={columns}
              dataSource={RECENT_BLOGS}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
