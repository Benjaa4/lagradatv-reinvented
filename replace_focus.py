import os, re
files = ['src/components/layout/FloatingNavbar.tsx', 'src/components/ui/CustomSelect.tsx', 'src/pages/admin/AdminBracketEditor.tsx', 'src/pages/admin/AdminMatchesTab.tsx', 'src/pages/admin/AdminMediaTab.tsx', 'src/pages/admin/AdminSettingsTab.tsx', 'src/pages/admin/AdminTeamsTab.tsx', 'src/pages/admin/AdminTournamentDetailPage.tsx', 'src/pages/admin/AdminTournamentsTab.tsx', 'src/pages/LoginPage.tsx']
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    new_content = re.sub(r'focus:border-primary/50(?!\s+focus:ring)', 'focus:border-primary/50 focus:ring-1 focus:ring-primary/30', content)
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f'Updated {f}')
