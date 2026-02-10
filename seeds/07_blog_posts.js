exports.seed = async function(knex) {
  await knex('blog_posts').del();

  await knex('blog_posts').insert([
    {
      title: 'Comment entretenir sa pose gel à domicile',
      slug: 'comment-entretenir-sa-pose-gel-a-domicile',
      excerpt: 'Découvrez tous mes conseils pour faire durer votre pose gel le plus longtemps possible et garder des ongles impeccables entre deux rendez-vous.',
      content: `<h2>Les gestes essentiels au quotidien</h2>
<p>Votre pose gel peut durer jusqu'à 3-4 semaines si vous en prenez bien soin ! Voici mes conseils de prothésiste ongulaire pour des ongles parfaits plus longtemps.</p>

<figure class="blog-inline-image">
  <img src="https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&q=80" alt="Mains soignées avec une belle pose gel" loading="lazy">
  <figcaption>Une pose gel bien entretenue peut durer jusqu'à 4 semaines</figcaption>
</figure>

<h3>1. Hydratez vos cuticules</h3>
<p>Appliquez une huile cuticules chaque soir avant de dormir. Cela nourrit l'ongle et la peau autour, évitant les décollements prématurés. L'huile de jojoba ou l'huile d'amande douce sont mes préférées !</p>

<h3>2. Portez des gants pour les tâches ménagères</h3>
<p>Les produits chimiques ménagers sont l'ennemi n°1 de votre pose. Investissez dans une bonne paire de gants ! Cela protège aussi bien le gel que la peau de vos mains.</p>

<div class="blog-tip-box">
  <p><strong>💡 Astuce de pro :</strong> Gardez une paire de gants sous l'évier de la cuisine et une autre dans votre salle de bain. Comme ça, pas d'excuse pour les oublier !</p>
</div>

<h3>3. Évitez d'utiliser vos ongles comme outils</h3>
<p>Ouvrir une canette, gratter une étiquette... Ces gestes du quotidien fragilisent la pose. Prenez l'habitude d'utiliser des ustensiles adaptés.</p>

<figure class="blog-inline-image">
  <img src="https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&q=80" alt="Produits de soin pour les ongles" loading="lazy">
  <figcaption>Des produits de qualité pour un entretien optimal</figcaption>
</figure>

<h3>4. Ne tentez pas de les réparer vous-même</h3>
<p>Si un ongle se casse ou se décolle, contactez-moi plutôt que d'essayer de le recoller avec de la super glue. Je pourrai faire une retouche propre et durable.</p>

<h2>Quand prévoir votre remplissage ?</h2>
<p>Je recommande un remplissage toutes les 3 à 4 semaines, selon la vitesse de pousse de vos ongles. N'attendez pas trop longtemps car la repousse visible fragilise la pose.</p>

<div class="blog-tip-box">
  <p><strong>📅 Bon à savoir :</strong> Pensez à réserver votre prochain remplissage directement en fin de rendez-vous ! Cela vous garantit un créneau qui vous convient.</p>
</div>`,
      cover_image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=80',
      author: 'Sarah',
      is_published: true,
      published_at: new Date('2025-01-15'),
      display_order: 1
    },
    {
      title: 'Tendances Nail Art 2025 : les incontournables',
      slug: 'tendances-nail-art-2025-les-incontournables',
      excerpt: 'Baby boomer, chrome, effet velours... Découvrez les tendances nail art qui vont marquer cette année et comment les adopter.',
      content: `<h2>Les tendances phares de l'année</h2>
<p>L'année 2025 s'annonce riche en créativité pour le nail art ! Voici les tendances que mes clientes adorent déjà.</p>

<h3>1. Le Baby Boomer revisité</h3>
<p>Le dégradé rose-blanc classique se réinvente avec des touches de paillettes subtiles ou des nuances pastel. Un intemporel toujours aussi élégant.</p>

<figure class="blog-inline-image">
  <img src="https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?w=800&q=80" alt="Ongles baby boomer élégants" loading="lazy">
  <figcaption>Le baby boomer : un classique intemporel et toujours chic</figcaption>
</figure>

<h3>2. L'effet Chrome</h3>
<p>Les ongles miroir sont de retour ! Chrome argenté, doré ou même holographique, cet effet futuriste fait sensation. Parfait pour une soirée ou simplement pour se démarquer au quotidien.</p>

<h3>3. Le Velvet Nails</h3>
<p>La nouvelle tendance qui fait fureur : un fini texturé velours ultra doux au toucher. Parfait pour l'automne-hiver, il apporte une dimension unique à vos ongles.</p>

<div class="blog-image-grid">
  <img src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&q=80" alt="Nail art créatif et coloré" loading="lazy">
  <img src="https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&q=80" alt="Design d'ongles minimaliste" loading="lazy">
</div>

<h3>4. Les motifs minimalistes</h3>
<p>Des lignes fines, des points délicats, des formes géométriques simples... Le minimalisme chic est toujours aussi populaire. Il s'adapte à toutes les occasions, du bureau à la soirée.</p>

<div class="blog-tip-box">
  <p><strong>✨ Mon conseil :</strong> N'hésitez pas à combiner les tendances ! Un baby boomer avec un accent chrome sur l'annulaire, c'est le combo parfait cette saison.</p>
</div>

<h3>5. Les teintes terracotta et earth tones</h3>
<p>Les couleurs terre sont plus que jamais tendance. Terracotta, brun chaud, nude rosé... Ces teintes naturelles apportent une élégance discrète et sophistiquée.</p>

<figure class="blog-inline-image">
  <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80" alt="Teintes naturelles et élégantes sur les ongles" loading="lazy">
  <figcaption>Les teintes naturelles : parfaites pour un look chic et raffiné</figcaption>
</figure>

<h2>Envie d'essayer ?</h2>
<p>N'hésitez pas à me contacter pour discuter du design qui vous fait envie. Je m'adapte à tous les styles et à toutes les envies ! Vous pouvez aussi me montrer vos inspirations Pinterest lors de votre rendez-vous.</p>`,
      cover_image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1200&q=80',
      author: 'Sarah',
      is_published: true,
      published_at: new Date('2025-02-01'),
      display_order: 2
    }
  ]);
};
