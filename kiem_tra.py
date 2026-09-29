"""Kiểm tra ĐỘC LẬP bộ đề sinh ra: tự tính lại đáp án bằng toán, không tin cờ 'dung' của bộ sinh đề.
Chạy: python3 kiem_tra.py   (đọc output/du_lieu_kiem_tra.json)
"""
import json, math
from fractions import Fraction
from decimal import Decimal, ROUND_HALF_UP
from itertools import combinations

d = json.load(open('output/du_lieu_kiem_tra.json', encoding='utf8'))
loi = []
PI = math.pi
pv = lambda f: f['num'] * PI / f['den']  # giá trị số của num·π/den

PARITY = {'cos': 'chẵn', 'sin': 'lẻ', 'tan': 'lẻ', 'cot': 'lẻ'}
def parity_numeric(fn):
    f = {'cos': math.cos, 'sin': math.sin, 'tan': math.tan, 'cot': lambda x: 1 / math.tan(x)}[fn]
    xs = [0.3, 0.7, 1.1]
    if all(abs(f(-x) - f(x)) < 1e-12 for x in xs): return 'chẵn'
    if all(abs(f(-x) + f(x)) < 1e-12 for x in xs): return 'lẻ'
    return 'không'

def smallest_period(g, candidates):
    """Chu kì dương nhỏ nhất trong danh sách ứng viên (kiểm bằng số)."""
    xs = [0.13, 0.41, 0.77, 1.01]
    ok = [T for T in candidates if all(abs(g(x + T) - g(x)) < 1e-9 for x in xs)]
    return min(ok) if ok else None

cands = sorted({Fraction(a, b) for a in range(1, 13) for b in range(1, 13)})

def key_letters(pb):
    order = d['thuTu'][str(pb['de'])]['tn']
    out = ''
    for i in order:
        c = pb['tn'][i]
        truths = [ok_option(c, p) for p in c['pa']]
        if sum(truths) != 1:
            loi.append(f"ĐỀ {pb['de']} pb{pb['stt']} câu gốc {c['goc']}: có {sum(truths)} phương án đúng")
        for p, t in zip(c['pa'], truths):
            if p['dung'] != t:
                loi.append(f"ĐỀ {pb['de']} pb{pb['stt']} câu gốc {c['goc']}: cờ đúng sai lệch ở '{p['txt']}'")
        out += 'ABCD'[truths.index(True)] if True in truths else '?'
    return out

def ok_option(c, p):
    g = c['goc']; dt = p['data']
    if g == 1:
        return parity_numeric(dt['fn']) == dt['tinh']
    if g == 2:
        k = c['thamSo']['k']
        T = smallest_period(lambda x: math.cos(k * x), [float(f) * PI for f in cands])
        return abs(pv(dt['T']) - T) < 1e-9
    if g == 3:
        return dt['dang'] == 'k180'  # cot có chu kì 180°; các dạng còn lại trộn đơn vị hoặc sai chu kì
    if g == 4:
        s = c['thamSo']['dau']
        cval = {'1/2': 0.5, '√2/2': math.sqrt(2) / 2, '√3/2': math.sqrt(3) / 2}[c['thamSo']['cTen']] * s
        x = pv(dt['x'])
        return abs(math.sin(x) - cval) < 1e-12 and -PI / 2 - 1e-12 <= x <= PI / 2 + 1e-12
    raise ValueError

def ds_truth(y, idx):
    dt = y['data']
    if idx == 0:  # tập giá trị của m cos x là [−m; m]
        return dt['n'] == dt['m']
    if idx == 1:
        T = smallest_period(lambda x: math.tan(dt['k'] * x), [float(f) * PI for f in cands])
        return abs(pv(dt['T']) - T) < 1e-9
    if idx == 2:  # tan không xác định tại π/2 + kπ; cot không xác định tại kπ
        return dt['fn'] == 'tan'
    if idx == 3:
        T = smallest_period(lambda x: math.sin(dt['k'] * x), [float(f) * PI for f in cands])
        return abs(pv(dt['T']) - T) < 1e-9

def ds_key(pb):
    order = d['thuTu'][str(pb['de'])]['ds']
    tr = [ds_truth(y, i) for i, y in enumerate(pb['c5']['y'])]
    for i, (y, t) in enumerate(zip(pb['c5']['y'], tr)):
        if y['dung'] != t: loi.append(f"ĐỀ {pb['de']} pb{pb['stt']} câu 5 ý {i}: cờ lệch")
    return ''.join('Đ' if tr[i] else 'S' for i in order)

def c6_answer(pb):
    p, q = pb['c6']['thamSo']['p'], pb['c6']['thamSo']['q']
    # cot α = p/q, 0<α<π/2 → tan α = q/p > 0
    v = Decimal(q) / Decimal(p)
    return str(v.quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)).replace('.', ',')

by = {(pb['de'], pb['stt']): pb for pb in d['phienBan']}
calc = {}
for k, pb in by.items():
    calc[k] = (key_letters(pb), ds_key(pb), c6_answer(pb))
    if calc[k][2] != pb['c6']['dapAn']: loi.append(f"{k}: câu 6 lệch {calc[k][2]} vs {pb['c6']['dapAn']}")

# Đáp án in trong file đáp án (theo từng tờ) phải khớp tính toán độc lập
for t in d['to']:
    kk = calc[(t['de'], t['stt'])]
    if (t['khoaTN'], t['khoaDS'], t['cau6']) != kk:
        loi.append(f"Số phiếu {t['soPhieu']}: đáp án in {t['khoaTN']},{t['khoaDS']},{t['cau6']} ≠ tính lại {kk}")

# Ràng buộc chống hỏi bài
sp = [t['soPhieu'] for t in d['to']]
if len(set(sp)) != len(sp): loi.append('Số phiếu bị trùng')
for a, b in zip(d['to'], d['to'][1:]):
    if a['de'] == b['de']: loi.append(f"Hai tờ liền nhau cùng nhãn: {a['thuTuPhat']}")
for a, b in zip(d['to'], d['to'][2:]):
    if (a['de'], a['stt']) == (b['de'], b['stt']): loi.append(f"Hai tờ cách 1 chỗ cùng phiên bản: {a['thuTuPhat']}")
for de in (1, 2):
    ks = [calc[k] for k in sorted(calc) if k[0] == de]
    for (i, a), (j, b) in combinations(enumerate(ks), 2):
        diff = sum(x != y for x, y in zip(a[0], b[0]))
        if diff < 3: loi.append(f"ĐỀ {de}: pb{i} và pb{j} chỉ khác {diff} câu ở phần I")
        if a[1] == b[1]: loi.append(f"ĐỀ {de}: pb{i} và pb{j} trùng mẫu Đ/S")
        if a[2] == b[2]: loi.append(f"ĐỀ {de}: pb{i} và pb{j} trùng đáp án câu 6")

print('Phiên bản ẩn:')
for (de, s), (a, b, c) in sorted(calc.items()):
    print(f'  ĐỀ {de} – pb{s}: Phần I {a} | Câu 5 {b} | Câu 6 {c}')
print(f"Số tờ: {len(d['to'])}, số phiếu khác nhau: {len(set(sp))}")
print('KẾT QUẢ:', 'KHÔNG CÓ LỖI' if not loi else f'{len(loi)} lỗi')
for e in loi: print('  -', e)
