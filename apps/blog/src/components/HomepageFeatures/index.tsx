import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import React, {useEffect, useState} from 'react';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy to Use',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Docusaurus was designed from the ground up to be easily installed and
        used to get your website up and running quickly.
      </>
    ),
  },
  {
    title: 'Focus on What Matters',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Docusaurus lets you focus on your docs, and we&apos;ll do the chores. Go
        ahead and move your docs into the <code>docs</code> directory.
      </>
    ),
  },
  {
    title: 'Powered by React',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Extend or customize your website layout by reusing React. Docusaurus can
        be extended while reusing the same header and footer.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): React.ReactNode {
  const [me, setMe] = useState<{ id: string; email: string; userName: string } | null>(null);


  const handleLogout = () => {
    // Clear local state
    setMe(null);
    // Redirect to identity portal logout
    window.location.href = 'http://identity.asafarim.local:5177/logout';
  };

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('http://api.asafarim.local:5190/auth/me', {
          method: 'GET',
          credentials: 'include', // send cookies
        });
        if (res.status === 401) {
          const returnUrl = encodeURIComponent(window.location.href);
          window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${returnUrl}`;
          return;
        }
        if (!res.ok) throw new Error(`auth/me failed: ${res.status}`);
        const data = await res.json();
        setMe({ id: data.id, email: data.email, userName: data.userName });
      } catch (e) {
        console.error(e);
      }
    };
    const cookies = document.cookie;
    console.log("cookies", cookies);
    if (!cookies) {
      check();
    }
  }, []);

  return (
    <section className={styles.features}>
      <div className="container">
        {me ? (
          <div className="text--center margin-bottom--xl">
            <Heading as="h1">Welcome, {me.userName || me.email}</Heading>
            <button 
              onClick={handleLogout}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#fa4d56',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="text--center margin-bottom--xl">
            <p>Checking session...</p>
          </div>
        )}
        <div className="row">
          {FeatureList.map((props, idx) => {
            // Use key on the wrapper element, not passed to the component
            return (
              <React.Fragment key={idx}>
                <Feature title={props.title} Svg={props.Svg} description={props.description} />
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}