import { useState } from 'react'
import WorkspaceGate from '../../app/WorkspaceGate'
import type { DocKind, WorkspaceSource } from '../../domain/workspace'

const DOC_TONE: Record<DocKind, string> = {
  PDF: 'linear-gradient(135deg,#F472B6,#DB2777)',
  DOC: 'linear-gradient(135deg,#60A5FA,#2563EB)',
  MD: 'linear-gradient(135deg,#5EEAD4,#0891B2)',
  XLS: 'linear-gradient(135deg,#FCD34D,#F59E0B)',
  PPT: 'linear-gradient(135deg,#94A3B8,#475569)',
}

export function KnowledgePage({ source }: { source: WorkspaceSource }) {
  const [activeCategory, setActiveCategory] = useState('all')

  return (
    <WorkspaceGate source={source} label="知识库">
      {({ documents, knowledgeCategories }) => {
        const visible =
          activeCategory === 'all'
            ? documents
            : documents.filter((doc) => doc.categoryId === activeCategory)

        return (
          <div className="view view--full">
            <div className="page">
              <div className="page-head">
                <div className="ph-text">
                  <h2>知识库</h2>
                  <p>沉淀产品资料与规范，让智能体在干活时随时引用</p>
                </div>
                <div className="page-actions">
                  <button className="btn-ghost" type="button">
                    新建集合
                  </button>
                  <button className="btn-primary" type="button">
                    上传文档
                  </button>
                </div>
              </div>

              <div className="split">
                <nav className="glass side-nav" aria-label="知识库分类">
                  {knowledgeCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      aria-current={category.id === activeCategory ? 'true' : undefined}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      {category.label}
                      <span className="cnt">{category.count}</span>
                    </button>
                  ))}
                </nav>

                <div className="stack-col">
                  <div className="glass dropzone">
                    <span className="plug-ico" style={{ background: 'var(--grad-mint)' }} aria-hidden="true">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                           strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 16V4.5M7.5 9 12 4.5 16.5 9" />
                        <path d="M4.5 16v2.5A2 2 0 0 0 6.5 20.5h11a2 2 0 0 0 2-2V16" />
                      </svg>
                    </span>
                    <strong>把文档拖到这里，或点击上传</strong>
                    <p>支持 PDF / Word / Markdown / 图片，单个不超过 50 MB</p>
                  </div>

                  <div className="glass card">
                    <div className="card-head">
                      <h3>最近更新</h3>
                      <span className="aside">已索引 {documents.filter((doc) => doc.indexed).length} 份</span>
                    </div>
                    <div className="stack-col" style={{ gap: 8 }}>
                      {visible.length === 0 ? (
                        <p className="mini" style={{ padding: '10px 2px' }}>
                          这个分类下还没有文档。
                        </p>
                      ) : null}
                      {visible.map((doc) => (
                        <div className="doc" key={doc.id}>
                          <span className="doc-ico" style={{ background: DOC_TONE[doc.kind] }} aria-hidden="true">
                            {doc.kind}
                          </span>
                          <span className="doc-meta">
                            <strong>{doc.name}</strong>
                            <span>
                              {doc.size} · {doc.updatedAt} · {doc.owner}
                            </span>
                          </span>
                          <span className="skill" style={doc.indexed ? undefined : { color: 'var(--ink-3)' }}>
                            {doc.indexed ? '已索引' : '待索引'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }}
    </WorkspaceGate>
  )
}

export default KnowledgePage
