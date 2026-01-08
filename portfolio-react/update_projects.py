import os
import json

# Define the root path for images
IMAGES_ROOT = "portfolio-react/public/images"
OUTPUT_FILE = "portfolio-react/src/data/projects.js"

# Allowed extensions
IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'}
VIDEO_EXTS = {'.mp4', '.mov', '.webm'}
PDF_EXTS = {'.pdf'}

# Priority order for projects (most important first)
# Projects not in this list will appear alphabetically after these
PRIORITY_ORDER = [
    'McCafe',
    'Mcdo',
    'Popeyes',
    'OPPO',
    'CwF',
    'MAC',
    'Freshdays',
    'Avene',
    'La Roche',
    'Gipsy',
    'Handy',
    'Cannelle',
    'Happies',
    'Al Hawari',
    'Sofar',
    'Sifr',
    'Ethos',
    'DGA',
    'FFF',
    'ASH',
    'Private',
]

def get_project_type(name):
    # Mapping for known projects based on previous file content
    known_types = {
        'avene': 'Skincare & Product Design',
        'cannelle': 'Product Photography',
        'ethos': 'Agency Branding',
        'freshdays': 'Social Media & Video',
        'gipsy': 'Restaurant Branding',
        'handy': 'Product Marketing',
        'cwf': 'Restaurant Branding',
        'mac': 'Agency',
        'la roche': 'Food & Beverage',
        'mccafe': 'Food & Beverage',
        'mcdo': 'Food & Beverage',
        'popeyes': 'Food & Beverage',
        'oppo': 'Tech & Electronics',
        'happies': 'Social Media & Video',
        'al hawari': 'Branding',
        'sofar': 'Tech & Product',
        'sifr': 'Branding',
        'dga': 'Government & Corporate',
        'fff': 'Food & Beverage',
        'ash': 'Beverage Branding',
        'private': 'Personal Projects',
        'aalaqaat': 'Branding',
        'ferra rawan': 'Branding',
        'rami baddour': 'Branding',
    }
    key = name.lower()
    return known_types.get(key, 'Portfolio Project')

def get_sort_key(client_name):
    """Return sort key - prioritized projects first, then alphabetical"""
    try:
        return (0, PRIORITY_ORDER.index(client_name))
    except ValueError:
        return (1, client_name.lower())

def scan_projects():
    projects = []
    
    # Get all subdirectories in IMAGES_ROOT
    try:
        clients = [d for d in os.listdir(IMAGES_ROOT) if os.path.isdir(os.path.join(IMAGES_ROOT, d)) and not d.startswith('.')]
    except FileNotFoundError:
        print(f"Error: Directory {IMAGES_ROOT} not found.")
        return

    # Sort by priority order
    clients.sort(key=get_sort_key)

    for client in clients:
        client_path = os.path.join(IMAGES_ROOT, client)
        
        project_images = []
        project_videos = []
        project_pdfs = []
        
        # Walk through the client folder to find all assets
        for root, dirs, files in os.walk(client_path):
            for file in files:
                if file.startswith('.'): continue
                
                ext = os.path.splitext(file)[1].lower()
                full_path = os.path.join(root, file)
                # Convert to web path: replace 'portfolio-react' with '' and ensure forward slashes
                # Since public/images -> ../images, we can access via /images/Client/...
                # But wait, the symlink is public/images -> images.
                # So web path should start with /images/
                
                rel_path = os.path.relpath(full_path, IMAGES_ROOT)
                web_path = f"/images/{rel_path}".replace(os.sep, '/')
                
                # Check for "optimized" logic: The user removed optimized folder, so we use files as is.
                
                if ext in IMAGE_EXTS:
                    project_images.append(web_path)
                elif ext in VIDEO_EXTS:
                    project_videos.append(web_path)
                elif ext in PDF_EXTS:
                    project_pdfs.append(web_path)

        # Sort assets to ensure consistent order
        project_images.sort()
        project_videos.sort()
        project_pdfs.sort()
        
        if not project_images and not project_videos and not project_pdfs:
            continue

        # Find best thumbnail - prioritize A1, then images without text/headlines
        def get_thumbnail_priority(path):
            filename = os.path.basename(path).lower()
            # A1 files are highest priority
            if filename.startswith('a1'):
                return (0, path)
            # B1, C1 etc are second priority
            if filename[0:2] in ['b1', 'c1', 's1']:
                return (1, path)
            # "No Headline" or minimal text images
            if 'no headline' in filename or 'grid' in filename:
                return (2, path)
            # Avoid images with obvious text markers
            if any(word in filename for word in ['headline', 'hiring', 'needed', 'specialist', 'reel']):
                return (5, path)
            # Default priority
            return (3, path)
        
        # Determine thumbnail - prioritize images, then videos, then use 'pdf' as marker
        if project_images:
            # Sort by priority and pick best
            sorted_by_priority = sorted(project_images, key=get_thumbnail_priority)
            thumbnail = sorted_by_priority[0]
        elif project_videos:
            thumbnail = project_videos[0]
        elif project_pdfs:
            thumbnail = 'pdf'  # Special marker for PDF-only projects
        else:
            thumbnail = ""
        
        project = {
            'id': client.lower().replace(' ', '-'),
            'name': client,
            'type': get_project_type(client),
            'thumbnail': thumbnail,
            'images': project_images,
            'videos': project_videos,
            'pdfs': project_pdfs
        }
        projects.append(project)

    return projects

def escape_js_string(s):
    """Escape special characters for JavaScript strings."""
    # Escape backslashes first, then quotes
    s = s.replace('\\', '\\\\')
    s = s.replace('"', '\\"')
    return s

def generate_js(projects):
    js_content = "// Portfolio Data - All projects with their images (Alphabetically sorted)\n"
    js_content += "export const projects = [\n"
    
    for p in projects:
        js_content += "  {\n"
        js_content += f'    id: "{escape_js_string(p["id"])}",\n'
        js_content += f'    name: "{escape_js_string(p["name"])}",\n'
        js_content += f'    type: "{escape_js_string(p["type"])}",\n'
        js_content += f'    thumbnail: "{escape_js_string(p["thumbnail"])}",\n'
        
        if p['images']:
            js_content += "    images: [\n"
            for img in p['images']:
                js_content += f'      "{escape_js_string(img)}",\n'
            js_content += "    ],\n"
        
        if p['videos']:
            js_content += "    videos: [\n"
            for vid in p['videos']:
                js_content += f'      "{escape_js_string(vid)}",\n'
            js_content += "    ],\n"
            
        if p['pdfs']:
            js_content += "    pdfs: [\n"
            for pdf in p['pdfs']:
                js_content += f'      "{escape_js_string(pdf)}",\n'
            js_content += "    ]\n"
        
        js_content += "  },\n"
        
    js_content += "]\n"
    
    # Add skills and experience data for About section
    js_content += """
// Skills data for About section
export const skills = [
  { name: 'Adobe Photoshop', percent: 95, icon: 'fab fa-adobe' },
  { name: 'Adobe Illustrator', percent: 90, icon: 'fab fa-adobe' },
  { name: 'Adobe After Effects', percent: 80, icon: 'fab fa-adobe' },
  { name: 'Figma', percent: 85, icon: 'fab fa-figma' },
  { name: 'Social Media Marketing', percent: 90, icon: 'fas fa-bullhorn' },
]

// Experience data for About section
export const experience = [
  { date: '2023 - Present', title: 'Senior Graphic Designer', company: 'MAC Platforms' },
  { date: '2021 - 2023', title: 'Graphic Designer', company: 'Ethos Agency (KSA)' },
  { date: '2019 - 2021', title: 'Junior Designer', company: 'Freelance' },
]
"""
    
    return js_content

if __name__ == "__main__":
    projects = scan_projects()
    if projects:
        js_code = generate_js(projects)
        with open(OUTPUT_FILE, 'w') as f:
            f.write(js_code)
        print(f"Successfully updated {OUTPUT_FILE} with {len(projects)} projects.")
