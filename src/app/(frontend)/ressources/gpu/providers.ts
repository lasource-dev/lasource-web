export type GPUProvider = {
  advantages: string[]
  clientScale: string
  description: string
  headquarters: string
  limitations: string[]
  name: string
  priceNames: string[]
  regions: string
  services: string[]
  slug: string
  sources: Array<{ label: string; url: string }>
  summary: string
  website: string
}

export const GPU_PROVIDERS: GPUProvider[] = [
  {
    slug: 'runpod', name: 'RunPod', priceNames: ['RunPod'], headquarters: 'États-Unis', regions: 'Infrastructure distribuée en Amérique du Nord et en Europe',
    summary: 'Un cloud GPU orienté développeurs, de la machine à la demande à l’inférence serverless.',
    description: 'RunPod réunit des GPU Pods configurables et une plateforme serverless conçue pour déployer des modèles et des workers conteneurisés. Son expérience développeur et sa facturation à l’usage en font une option accessible pour prototyper puis industrialiser.',
    services: ['GPU Pods à la demande', 'Endpoints serverless', 'Stockage réseau', 'Images et templates communautaires', 'API et CLI'],
    advantages: ['Prise en main rapide', 'Large choix de GPU', 'Déploiement par conteneur', 'Adapté au prototypage comme à l’inférence'],
    limitations: ['Disponibilité et localisation variables selon les GPU', 'Le coût complet dépend du stockage et du trafic'],
    clientScale: 'Non communiqué publiquement', website: 'https://www.runpod.io/',
    sources: [{ label: 'Site officiel', url: 'https://www.runpod.io/' }, { label: 'Documentation Serverless', url: 'https://docs.runpod.io/serverless/overview' }],
  },
  {
    slug: 'vast-ai', name: 'Vast.ai', priceNames: ['Vast.ai', 'Vast'], headquarters: 'États-Unis', regions: '40+ centres de données annoncés',
    summary: 'Une place de marché qui met en concurrence des capacités GPU distribuées.',
    description: 'Vast.ai agrège l’offre d’hébergeurs indépendants et de centres de données dans une place de marché. Les utilisateurs choisissent une machine selon son GPU, son prix, sa fiabilité et sa localisation, avec plusieurs modes de location.',
    services: ['Instances GPU', 'Offres à la demande, interruptibles et réservées', 'Serverless', 'Clusters', 'API'],
    advantages: ['Prix compétitifs par mise en concurrence', 'Grand choix de modèles', 'Filtres techniques détaillés', 'Déploiement Docker'],
    limitations: ['Qualité et disponibilité variables selon l’hôte', 'Comparer aussi stockage, bande passante et fiabilité'],
    clientScale: '700 000+ transactions mensuelles annoncées ; nombre de clients non publié', website: 'https://vast.ai/',
    sources: [{ label: 'Site officiel', url: 'https://vast.ai/' }, { label: 'Présentation de Vast.ai', url: 'https://vast.ai/about' }],
  },
  {
    slug: 'lambda', name: 'Lambda', priceNames: ['Lambda'], headquarters: 'États-Unis', regions: 'Principalement États-Unis',
    summary: 'Un cloud IA spécialisé dans les instances et clusters NVIDIA.',
    description: 'Lambda fournit des machines GPU individuelles, des clusters prêts à l’emploi et des superclusters pour l’entraînement et l’inférence. L’environnement est préconfiguré pour les principaux frameworks de machine learning.',
    services: ['Instances GPU', 'Clusters 1-Click', 'Superclusters', 'Cloud privé', 'Images ML préconfigurées'],
    advantages: ['Infrastructure spécialisée IA', 'Montée en charge vers de grands clusters', 'Pile logicielle ML prête à l’emploi'],
    limitations: ['Empreinte géographique plus limitée que les hyperscalers', 'Capacités récentes souvent sur devis'],
    clientScale: 'Non communiqué publiquement', website: 'https://lambda.ai/',
    sources: [{ label: 'Lambda AI Cloud', url: 'https://lambda.ai/welcome/ai-cloud' }, { label: 'Documentation Public Cloud', url: 'https://docs.lambda.ai/public-cloud/' }],
  },
  {
    slug: 'fal', name: 'fal', priceNames: ['Fal', 'fal'], headquarters: 'États-Unis', regions: 'Infrastructure mondiale gérée',
    summary: 'Une plateforme d’inférence serverless spécialisée dans les médias génératifs.',
    description: 'fal cible le déploiement et l’exécution de modèles génératifs, notamment image, vidéo et audio. La plateforme propose un catalogue d’API et permet aussi d’exécuter des modèles personnalisés sans administrer les GPU.',
    services: ['API de modèles', 'Inférence serverless', 'Workloads personnalisés', 'Clusters dédiés', 'File d’attente et autoscaling'],
    advantages: ['Très adaptée à l’inférence média', 'Mise en production rapide', 'Paiement à l’usage', 'Catalogue de modèles'],
    limitations: ['Moins adaptée à une VM GPU généraliste', 'Le coût dépend du temps d’exécution et du modèle'],
    clientScale: '2,5 millions de développeurs annoncés', website: 'https://fal.ai/',
    sources: [{ label: 'Site officiel', url: 'https://fal.ai/' }, { label: 'Plateforme Serverless', url: 'https://fal.ai/serverless' }],
  },
  {
    slug: 'coreweave', name: 'CoreWeave', priceNames: ['CoreWeave'], headquarters: 'États-Unis', regions: 'États-Unis et Europe',
    summary: 'Un cloud spécialisé pour les charges IA à grande échelle.',
    description: 'CoreWeave exploite une plateforme cloud conçue autour des calculs accélérés. Elle associe GPU, stockage, réseau et services managés pour l’entraînement, l’inférence, le rendu et les charges HPC.',
    services: ['GPU et CPU compute', 'Bare metal', 'Stockage objet et fichiers', 'Réseau', 'Kubernetes et services managés'],
    advantages: ['Infrastructure optimisée GPU', 'Choix de GPU NVIDIA récents', 'Outillage pour les grands clusters', 'Services de plateforme intégrés'],
    limitations: ['Accès et conditions souvent orientés entreprises', 'Prix et capacité peuvent nécessiter un échange commercial'],
    clientScale: 'Non communiqué publiquement', website: 'https://www.coreweave.com/',
    sources: [{ label: 'Plateforme CoreWeave', url: 'https://www.coreweave.com/' }, { label: 'Produits', url: 'https://www.coreweave.com/products' }],
  },
  {
    slug: 'google-cloud', name: 'Google Cloud', priceNames: ['Google Cloud', 'GCP'], headquarters: 'États-Unis', regions: 'Réseau mondial de régions cloud',
    summary: 'L’offre GPU de Google Cloud intégrée à Compute Engine, GKE et Vertex AI.',
    description: 'Google Cloud propose des accélérateurs NVIDIA via des machines virtuelles et des services managés. L’offre s’intègre à son écosystème data et IA, de l’expérimentation dans Vertex AI aux clusters GKE.',
    services: ['VM Compute Engine avec GPU', 'GKE', 'Vertex AI', 'TPU', 'Stockage et réseau cloud'],
    advantages: ['Écosystème data et IA complet', 'Présence mondiale', 'Sécurité et gouvernance entreprise', 'Services managés'],
    limitations: ['Tarification complexe', 'Quotas GPU et disponibilité par région', 'Frais de réseau à surveiller'],
    clientScale: 'Non publié pour les seuls services GPU', website: 'https://cloud.google.com/compute/gpus',
    sources: [{ label: 'GPU Compute Engine', url: 'https://cloud.google.com/compute/docs/gpus' }, { label: 'Tarification GPU', url: 'https://cloud.google.com/compute/gpus-pricing' }],
  },
  {
    slug: 'aws', name: 'AWS', priceNames: ['AWS', 'Amazon Web Services'], headquarters: 'États-Unis', regions: 'Réseau mondial de régions cloud',
    summary: 'Des instances GPU intégrées au plus vaste catalogue de services AWS.',
    description: 'AWS fournit des GPU dans plusieurs familles d’instances EC2 et via des services IA managés. Les équipes peuvent construire une architecture complète autour de SageMaker, EKS, stockage, réseau et sécurité AWS.',
    services: ['Instances EC2 accélérées', 'SageMaker', 'EKS et ECS', 'Capacity Blocks', 'Stockage et réseau AWS'],
    advantages: ['Très large écosystème cloud', 'Couverture géographique', 'Options de réservation et Spot', 'Gouvernance entreprise'],
    limitations: ['Comparaison des instances et prix complexe', 'Quotas et capacité selon région', 'Coûts annexes à modéliser'],
    clientScale: 'Non publié pour les seuls services GPU', website: 'https://aws.amazon.com/ec2/instance-types/accelerated-computing/',
    sources: [{ label: 'Instances accélérées EC2', url: 'https://aws.amazon.com/ec2/instance-types/accelerated-computing/' }, { label: 'Tarification EC2', url: 'https://aws.amazon.com/ec2/pricing/' }],
  },
  {
    slug: 'microsoft-azure', name: 'Microsoft Azure', priceNames: ['Microsoft Azure', 'Azure'], headquarters: 'États-Unis', regions: 'Réseau mondial de régions cloud',
    summary: 'Des VM NVIDIA et services IA intégrés à l’écosystème Microsoft Azure.',
    description: 'Azure propose plusieurs familles de machines virtuelles accélérées ainsi que des services managés pour entraîner et servir des modèles. L’offre s’intègre à Azure Machine Learning, AKS, au stockage et aux outils de gouvernance Microsoft.',
    services: ['VM GPU séries N', 'Azure Machine Learning', 'AKS', 'Azure AI', 'Stockage et réseau'],
    advantages: ['Intégration à l’écosystème Microsoft', 'Couverture mondiale', 'Sécurité et conformité entreprise', 'Services IA managés'],
    limitations: ['Tarification et références de VM complexes', 'Quotas de capacité', 'Disponibilité variable par région'],
    clientScale: 'Non publié pour les seuls services GPU', website: 'https://azure.microsoft.com/pricing/details/virtual-machines/linux/',
    sources: [{ label: 'Tailles de VM GPU', url: 'https://learn.microsoft.com/azure/virtual-machines/sizes-gpu' }, { label: 'Tarification des VM', url: 'https://azure.microsoft.com/pricing/details/virtual-machines/linux/' }],
  },
  {
    slug: 'nebius', name: 'Nebius', priceNames: ['Nebius'], headquarters: 'Pays-Bas', regions: 'Europe, États-Unis et autres déploiements annoncés',
    summary: 'Un cloud full-stack conçu spécialement pour l’IA et les clusters NVIDIA.',
    description: 'Nebius conçoit une infrastructure et une couche cloud optimisées pour l’entraînement et l’inférence. Le service permet de partir d’un GPU et d’évoluer vers des clusters préoptimisés avec Kubernetes ou Slurm.',
    services: ['GPU Cloud', 'Clusters Kubernetes et Slurm', 'Stockage haute performance', 'Token Factory pour l’inférence', 'Services managés IA'],
    advantages: ['Architecture conçue pour l’IA', 'GPU NVIDIA récents', 'Réseau InfiniBand', 'Présence européenne'],
    limitations: ['Fournisseur plus récent', 'Certaines capacités sont commercialisées sur engagement'],
    clientScale: 'Non communiqué publiquement', website: 'https://nebius.com/',
    sources: [{ label: 'Nebius AI Cloud', url: 'https://nebius.com/' }, { label: 'Présentation du groupe', url: 'https://group.nebius.com/businesses' }],
  },
  {
    slug: 'tensordock', name: 'TensorDock', priceNames: ['TensorDock'], headquarters: 'États-Unis', regions: '100+ localisations dans plus de 20 pays annoncées',
    summary: 'Une place de marché GPU mondiale pilotable par API.',
    description: 'TensorDock fédère un réseau d’hébergeurs pour proposer des machines GPU et CPU à la demande. La plateforme met l’accent sur la diversité géographique, les déploiements rapides et une API unifiée.',
    services: ['VM GPU et CPU', 'API de déploiement', 'Images Linux et Windows', 'Réseau mondial d’hébergeurs'],
    advantages: ['Nombreuses localisations', 'Large variété de GPU', 'Support Windows', 'Prix de marketplace'],
    limitations: ['Stock immédiat variable selon le lieu', 'Caractéristiques et prix diffèrent entre hôtes'],
    clientScale: 'Non communiqué publiquement', website: 'https://www.tensordock.com/',
    sources: [{ label: 'Site officiel', url: 'https://www.tensordock.com/' }, { label: 'Documentation', url: 'https://docs.tensordock.com/' }],
  },
  {
    slug: 'scaleway', name: 'Scaleway', priceNames: ['Scaleway'], headquarters: 'France', regions: 'Europe, dont France, Pays-Bas et Pologne',
    summary: 'Un cloud européen proposant des instances GPU et des services IA managés.',
    description: 'Scaleway fournit des instances GPU dans ses régions européennes et développe une pile IA comprenant entraînement, inférence et plateformes managées. Son positionnement européen facilite les projets attentifs à la localisation des données.',
    services: ['Instances GPU', 'Inference managée', 'Kubernetes Kapsule', 'Stockage objet', 'Services cloud européens'],
    advantages: ['Implantation européenne', 'Facturation lisible', 'Écosystème cloud complet', 'Support en français'],
    limitations: ['Catalogue et couverture plus réduits que les hyperscalers', 'Disponibilité des GPU selon zone'],
    clientScale: 'Non publié pour les seuls services GPU', website: 'https://www.scaleway.com/en/gpu-instances/',
    sources: [{ label: 'Instances GPU', url: 'https://www.scaleway.com/en/gpu-instances/' }, { label: 'Tarification', url: 'https://www.scaleway.com/en/pricing/' }],
  },
  {
    slug: 'ovhcloud', name: 'OVHcloud', priceNames: ['OVHcloud', 'OVH'], headquarters: 'France', regions: 'Réseau international, avec plusieurs régions européennes',
    summary: 'Des instances GPU dans un cloud européen généraliste et souverain.',
    description: 'OVHcloud propose des instances Public Cloud accélérées par GPU, intégrées à son stockage, ses réseaux privés et ses services Kubernetes. L’offre vise l’IA, le calcul scientifique, le rendu et les bureaux distants.',
    services: ['Instances GPU Public Cloud', 'AI Training et AI Deploy', 'Kubernetes managé', 'Stockage objet', 'Réseau privé'],
    advantages: ['Entreprise européenne', 'Écosystème cloud complet', 'Facturation à l’usage', 'Options de localisation en France et en Europe'],
    limitations: ['Choix de GPU et zones à vérifier', 'Disponibilité de certaines références limitée'],
    clientScale: 'Non publié pour les seuls services GPU', website: 'https://www.ovhcloud.com/en/public-cloud/gpu/',
    sources: [{ label: 'GPU Public Cloud', url: 'https://www.ovhcloud.com/en/public-cloud/gpu/' }, { label: 'AI Solutions', url: 'https://www.ovhcloud.com/en/public-cloud/ai-machine-learning/' }],
  },
]

export const getGPUProvider = (slug: string) => GPU_PROVIDERS.find((provider) => provider.slug === slug)

export const getGPUProviderSlug = (name: string) => {
  const normalized = name.toLocaleLowerCase('fr-FR')
  return GPU_PROVIDERS.find((provider) => provider.priceNames.some((alias) => alias.toLocaleLowerCase('fr-FR') === normalized))?.slug
}
