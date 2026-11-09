"""Generator für die Ornament-Symbole (Xiangyun-Wolken + Hui-Mäander).

Spirale = Kette aus Halbkreisen mit abnehmendem Radius; jeder Halbkreis endet
auf derselben Vertikalen (bzw. Horizontalen), der Mittelpunkt springt.
"""
import json, sys

def f(n):
    s = f"{n:.2f}".rstrip('0').rstrip('.')
    return s

def spiral(x, y, radii, up=True, ccw=True):
    """Start in (x,y) auf einer horizontalen Linie, Spirale über/unter der Linie.
    up=True: erster Halbbogen geht nach oben. ccw: Drehrichtung auf dem Bildschirm."""
    d = ''
    sweep = 0 if ccw else 1
    sign = -1 if up else 1
    cy = y
    for i, r in enumerate(radii):
        ny = cy + sign * 2 * r
        d += f"A{f(r)} {f(r)} 0 0 {sweep} {f(x)} {f(ny)}"
        cy = ny
        sign = -sign
    return d

def cloud_a():
    # Hauptranke: langer Schweif → große Spirale (nach oben, gegen Uhrzeigersinn)
    p1 = "M0 112H196" + spiral(196, 112, [46, 32, 20, 10])
    # Nebenranke oben links, gleiche Drehrichtung
    p2 = "M30 70H116" + spiral(116, 70, [22, 14, 7])
    # Gegenschwung: kurzer Schweif rechts unten, rollt sich nach unten ein
    p3 = "M318 134H262" + spiral(262, 134, [11, 6], up=False, ccw=True)
    return [p1, p2, p3], "-12 -6 350 170"

def cloud_b():
    p1 = "M270 16H86" + spiral(86, 16, [38, 26, 15, 7], up=False, ccw=True)
    p2 = "M232 58H170" + spiral(170, 58, [18, 11, 5], up=False, ccw=True)
    return [p1, p2], "-6 -8 290 112"

def cloud_c():
    p1 = "M0 70H82" + spiral(82, 70, [30, 20, 11])
    p2 = "M26 98H124" + spiral(124, 98, [12, 6], up=True, ccw=True)
    return [p1, p2], "-8 -2 156 112"

def orn():
    # symmetrischer Trenner: zwei Ranken rollen sich zur Mitte ein, Punkt darüber
    l = "M-170 0H-30" + spiral(-30, 0, [15, 9, 4], up=True, ccw=True)
    r = "M170 0H30" + spiral(30, 0, [15, 9, 4], up=True, ccw=False)
    dot = "M0 -36v0"
    return [l, r, dot], "-176 -48 352 56"

def fret():
    # Hui-Wen-Band, Modul 36×24, nahtlos kachelbar
    d = "M0 21H6V3H30V15H14V9H22"
    return [d, "M30 15V21H36"], "0 0 36 24"

SHAPES = {'cl-a': cloud_a, 'cl-b': cloud_b, 'cl-c': cloud_c, 'orn': orn}
def symbol(id_, paths, vb, outer=9, inner=6):
    out = [f'  <symbol id="{id_}" viewBox="{vb}" overflow="visible">', '    <g class="rb">']
    for p in paths:
        out.append(f'      <path class="o" d="{p}"/>')
    for p in paths:
        out.append(f'      <path class="i" d="{p}"/>')
    out += ['    </g>', '  </symbol>']
    return '\n'.join(out)

if __name__ == '__main__':
    print('\n'.join(symbol(k, *fn()) for k, fn in SHAPES.items()))
