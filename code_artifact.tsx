import React, { useState, useRef } from 'react';
import { Bot, Cpu, Sparkles } from 'lucide-react';

export default function App() {
  const [result, setResult] = useState('図形を僕に渡してね！');
  const [isHovered, setIsHovered] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 手渡し（ドラッグ）操作用のStateとRefを追加
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const robotRef = useRef(null);

  // 用意された図形のデータ
  const items = [
    { id: 'red-circle', shape: 'circle', color: 'bg-red-500', name: '赤い丸' },
    { id: 'yellow-circle', shape: 'circle', color: 'bg-yellow-400', name: '黄色い丸' },
    { id: 'green-circle', shape: 'circle', color: 'bg-green-500', name: '緑の丸' },
    { id: 'blue-square', shape: 'square', color: 'bg-blue-500', name: '青い四角' },
  ];

  // ポインター（マウス/指）を押した時の処理
  const handlePointerDown = (e, id) => {
    if (isAnalyzing) return; // 解析中は掴めないようにする
    setDraggingItem(id);
    setDragPos({ x: e.clientX, y: e.clientY });
    setStartPos({ x: e.clientX, y: e.clientY });
    e.target.setPointerCapture(e.pointerId); // 要素外に移動しても追従させる
  };

  // ポインターを動かした時の処理
  const handlePointerMove = (e) => {
    if (!draggingItem) return;
    setDragPos({ x: e.clientX, y: e.clientY });

    // ロボットエリアに重なっているか判定
    if (robotRef.current) {
      const rect = robotRef.current.getBoundingClientRect();
      const isInside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      setIsHovered(isInside);
    }
  };

  // ポインターを離した時の処理
  const handlePointerUp = (e) => {
    if (!draggingItem) return;

    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy); // どれくらい動かしたか

    if (robotRef.current) {
      const rect = robotRef.current.getBoundingClientRect();
      const isInside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );

      // ロボットのエリア内で離した場合
      if (isInside) {
        processItem(draggingItem);
      } 
      // ほとんど動かさずに離した場合は「タップ（クリック）」とみなす
      else if (distance < 5) {
        processItem(draggingItem);
      }
    }

    setDraggingItem(null);
    setIsHovered(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  // 画像認識（という設定の）処理
  const processItem = (id) => {
    if (isAnalyzing) return; // 処理中は受け付けない

    setIsAnalyzing(true);
    setResult('ウィーン… 画像を解析中…');

    // 0.8秒後に結果を出す（AIっぽい演出）
    setTimeout(() => {
      setIsAnalyzing(false);
      switch(id) {
        case 'red-circle': 
          setResult('これは...【 🍎 りんご 】です！'); 
          break;
        case 'yellow-circle': 
          setResult('これは...【 🍌 バナナ 】です！'); 
          break;
        case 'green-circle': 
          setResult('これは...【 🥑 アボカド 】です！'); 
          break;
        case 'blue-square': 
          setResult('これは...【 🍎 りんご 】【 🍌 バナナ 】【 🥑 アボカド 】の詰め合わせです！'); 
          break;
        default: 
          setResult('【 ❓ なぞの物体 】です。認識できませんでした。');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-800 overflow-hidden">
      
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden relative z-10">
        {/* ヘッダー */}
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            AI画像認識シミュレーター
          </h1>
          <p className="text-indigo-100 mt-2 text-sm">
            図形をドラッグ＆ドロップするか、タップしてロボットに渡してみてね
          </p>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          
          {/* 左側: アイテム一覧 */}
          <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-xl border-2 border-slate-200 border-dashed">
            <h2 className="font-bold text-slate-600 text-center mb-2">渡せるアイテム</h2>
            <div className="grid grid-cols-2 gap-6 justify-items-center">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col items-center gap-2">
                  <div
                    onPointerDown={(e) => handlePointerDown(e, item.id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className={`
                      w-20 h-20 shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform touch-none select-none
                      ${item.color} 
                      ${item.shape === 'circle' ? 'rounded-full' : 'rounded-xl'}
                      ${draggingItem === item.id ? 'opacity-30' : 'opacity-100'}
                    `}
                    title={`${item.name} (掴んでロボットに渡す)`}
                  />
                  <span className="text-xs font-medium text-slate-500">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 右側: ロボットエリア */}
          <div className="flex flex-col items-center justify-end">
            
            {/* 吹き出し (結果表示) */}
            <div className={`
              relative w-full text-center p-4 rounded-xl shadow-sm mb-4 border-2 transition-colors duration-300
              ${isAnalyzing ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50 border-blue-200 text-blue-800'}
            `}>
              <p className="font-bold text-lg whitespace-pre-wrap leading-relaxed min-h-[3rem] flex items-center justify-center">
                {result}
              </p>
              {/* 吹き出しの尻尾 */}
              <div className={`
                absolute top-full left-1/2 -translate-x-1/2 border-[12px] border-transparent 
                ${isAnalyzing ? 'border-t-amber-200' : 'border-t-blue-200'}
              `}></div>
              <div className={`
                absolute top-[calc(100%-3px)] left-1/2 -translate-x-1/2 border-[10px] border-transparent 
                ${isAnalyzing ? 'border-t-amber-50' : 'border-t-blue-50'}
              `}></div>
            </div>

            {/* ロボット本体 (ドロップエリア) */}
            <div
              ref={robotRef}
              className={`
                w-full h-48 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300
                ${isHovered 
                  ? 'bg-indigo-100 border-4 border-indigo-400 scale-105 shadow-inner' 
                  : 'bg-slate-100 border-4 border-slate-300 border-dashed'}
              `}
            >
              {isAnalyzing ? (
                <Cpu className="w-20 h-20 text-amber-500 animate-spin-slow" style={{ animationDuration: '3s' }} />
              ) : (
                <Bot className={`w-20 h-20 ${isHovered ? 'text-indigo-600 animate-bounce' : 'text-slate-500'}`} />
              )}
              <span className={`font-bold ${isHovered ? 'text-indigo-600' : 'text-slate-500'}`}>
                {isHovered ? 'ここに離して！' : 'ここにドロップ！'}
              </span>
            </div>

          </div>
        </div>
      </div>
      
      {/* ドラッグ中（手渡し中）に指やマウスに追従するアイテムのクローン */}
      {draggingItem && (
        <div 
          className="fixed pointer-events-none z-50 flex items-center justify-center drop-shadow-2xl scale-110"
          style={{ 
            left: dragPos.x, 
            top: dragPos.y,
            transform: 'translate(-50%, -50%)' // カーソル/指の中心に配置
          }}
        >
          {(() => {
            const item = items.find(i => i.id === draggingItem);
            return (
              <div className={`
                w-20 h-20 shadow-lg opacity-90
                ${item.color} 
                ${item.shape === 'circle' ? 'rounded-full' : 'rounded-xl'}
              `} />
            );
          })()}
        </div>
      )}

    </div>
  );
}