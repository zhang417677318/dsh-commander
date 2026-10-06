import WorkspaceGate from '../../app/WorkspaceGate'
import type { StorageSlice, WorkspaceSource } from '../../domain/workspace'

const TONE_COLOR: Record<StorageSlice['tone'], string> = {
  teal: 'linear-gradient(90deg,#5EEAD4,#0891B2)',
  blue: 'linear-gradient(90deg,#60A5FA,#2563EB)',
  amber: 'linear-gradient(90deg,#FCD34D,#F59E0B)',
  violet: 'linear-gradient(90deg,#A78BFA,#7C3AED)',
}

const TONE_DOT: Record<StorageSlice['tone'], string> = {
  teal: '#0891B2',
  blue: '#2563EB',
  amber: '#F59E0B',
  violet: '#7C3AED',
}

const KIND_TONE: Record<string, string> = {
  DIR: 'linear-gradient(135deg,#5EEAD4,#0891B2)',
  ZIP: 'linear-gradient(135deg,#60A5FA,#2563EB)',
  PDF: 'linear-gradient(135deg,#F472B6,#DB2777)',
  XLS: 'linear-gradient(135deg,#FCD34D,#F59E0B)',
  LOG: 'linear-gradient(135deg,#A78BFA,#7C3AED)',
}

export function FilesPage({ source }: { source: WorkspaceSource }) {
  return (
    <WorkspaceGate source={source} label="文件管理">
      {({ files, storage }) => (
        <div className="view view--full">
          <div className="page">
            <div className="page-head">
              <div className="ph-text">
                <h2>文件管理</h2>
                <p>团队共享的工作空间，智能体产出的文件都会落到这里</p>
              </div>
              <div className="page-actions">
                <button className="btn-ghost" type="button">
                  新建文件夹
                </button>
                <button className="btn-primary" type="button">
                  上传
                </button>
              </div>
            </div>

            <div className="glass storage">
              <div className="milestone" style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-2)' }}>
                已用 12.4 GB
                <span className="dotline" />
                共 50 GB
              </div>
              <div
                className="total"
                role="img"
                aria-label={`存储占用：${storage.map((slice) => `${slice.label} ${slice.amount}`).join('，')}`}
              >
                {storage.map((slice) => (
                  <i
                    key={slice.id}
                    style={{ width: `${slice.percent}%`, background: TONE_COLOR[slice.tone] }}
                  />
                ))}
              </div>
              <div className="legend">
                {storage.map((slice) => (
                  <span key={slice.id}>
                    <i style={{ background: TONE_DOT[slice.tone] }} />
                    {slice.label} {slice.amount}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass card" style={{ padding: 0 }}>
              <div className="card-head" style={{ padding: '16px 18px 0', marginBottom: 10 }}>
                <div className="crumbs">
                  <span>工作空间</span>
                  <span aria-hidden="true">/</span>
                  <b>美容院小程序</b>
                </div>
                <span className="aside">共 {files.length} 项</span>
              </div>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>大小</th>
                    <th>修改时间</th>
                    <th>负责人</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id}>
                      <td>
                        <span className="file">
                          <span
                            className="doc-ico"
                            style={{ background: KIND_TONE[file.kind] ?? 'var(--grad-brand)' }}
                            aria-hidden="true"
                          >
                            {file.kind}
                          </span>
                          {file.name}
                        </span>
                      </td>
                      <td className="num">{file.size}</td>
                      <td className="num">{file.updatedAt}</td>
                      <td>{file.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </WorkspaceGate>
  )
}

export default FilesPage
