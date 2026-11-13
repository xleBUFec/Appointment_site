import React from 'react';
import { AuditLog } from '../../types';
import { History, Shield, Clock, User, CheckCircle2 } from 'lucide-react';

interface AdminLogsTabProps {
  logs: AuditLog[];
}

export const AdminLogsTab: React.FC<AdminLogsTabProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      
      <div>
        <h3 className="font-serif text-lg font-bold text-[#f8f5ee]">
          Журнал аудита действий (Audit Trail)
        </h3>
        <p className="text-xs text-[#8b949e]">
          Фиксация всех изменений прайса, контента, подтверждений и отмен заявок
        </p>
      </div>

      <div className="space-y-2.5">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#8b949e] border border-dashed border-[#21262d] rounded-2xl">
            Событий пока не зафиксировано
          </div>
        ) : (
          logs.map(log => {
            const dateStr = new Date(log.timestamp).toLocaleString('ru-RU', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });
            return (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#0e1117] border border-[#21262d] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#f8f5ee]">{log.action}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        log.user_role === 'admin'
                          ? 'bg-purple-950/40 text-purple-300 border border-purple-500/30'
                          : log.user_role === 'master'
                          ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-950/40 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {log.user_role === 'admin' ? 'Администратор' : log.user_role === 'master' ? 'Мастер' : 'Клиент'}
                    </span>
                  </div>

                  <div className="text-[#8b949e]">{log.details}</div>
                </div>

                <div className="flex sm:flex-col sm:items-end justify-between text-[#8b949e] text-[11px] pt-1 sm:pt-0 border-t sm:border-t-0 border-[#21262d]">
                  <div className="flex items-center gap-1 font-medium text-[#c0c7d0]">
                    <User className="w-3.5 h-3.5 text-[#c59b27]" />
                    <span>{log.user_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{dateStr}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
